const db = require("../config/database");
const ArspMember = require("../models/ArspMember");
const ArspDocumentVerification = require("../models/ArspDocumentVerification");
const RtseResultQr = require("../models/RtseResultQr");
const RtseResult = require("../models/RtseResult");
const RtseSetting = require("../models/RtseSetting");

exports.verify = async (req, res) => {
    try {
        const raw = String(req.body?.value || "").trim();

        if (!raw) {
            return res.status(400).json({
                valid: false,
                message: "No QR data received."
            });
        }

        let url;

        try {
            url = new URL(raw);
        } catch {
            return res.status(400).json({
                valid: false,
                message: "Invalid QR code."
            });
        }

        const pathname = url.pathname.replace(/\/+$/, "");

        // ==========================================
        // RTSE RESULT QR
        // RTSE-RESULT-<secure-token>
        // ==========================================
        const rtseTokenMatch =
            raw.match(/RTSE-RESULT-[a-f0-9]{64}/i) ||
            pathname.match(/RTSE-RESULT-[a-f0-9]{64}/i);

        if (rtseTokenMatch) {
            const rtseToken = rtseTokenMatch[0];

            const rtseSetting = await RtseSetting.get();

            if (!rtseSetting || Number(rtseSetting.result_publish) !== 1) {
                return res.json({
                    type: "rtse_result",
                    valid: false,
                    published: false,
                    message: "RTSE results have not been published yet."
                });
            }

            const qrRecord =
                await RtseResultQr.getByToken(rtseToken);

            if (!qrRecord) {
                return res.json({
                    type: "rtse_result",
                    valid: false,
                    message: "Invalid RTSE result QR code."
                });
            }

            if (
                Number(qrRecord.archive) !== 0 ||
                qrRecord.status !== "Approved" ||
                Number(qrRecord.admit_generated) !== 1 ||
                !qrRecord.roll_no
            ) {
                return res.json({
                    type: "rtse_result",
                    valid: false,
                    message: "This RTSE QR code is no longer valid."
                });
            }

            const studentResult =
                await RtseResult.getByApplication(
                    qrRecord.application_id
                );

            if (!studentResult) {
                return res.json({
                    type: "rtse_result",
                    valid: false,
                    message: "RTSE result is not available yet."
                });
            }

            return res.json({
                type: "rtse_result",
                valid: true,
                published: true,
                message: "Congratulations!",
                result: {
                    full_name: qrRecord.full_name,
                    class: qrRecord.class,
                    section: qrRecord.section,
                    application_year:
                        qrRecord.application_year ||
                        studentResult.application_year ||
                        rtseSetting.exam_year,
                    rank: studentResult.overall_rank,
                    overall_rank: studentResult.overall_rank,
                    section_rank: studentResult.section_rank
                }
            });
        }

        // ==========================================
        // MEMBER QR
        // /arsp/verify/ARSP000059
        // ==========================================

        const memberMatch =
            pathname.match(/^\/arsp\/verify\/([^/]+)$/);

        if (memberMatch) {
            const memberId =
                decodeURIComponent(memberMatch[1]);

            const [rows] = await db.query(
                `SELECT *
                 FROM arsp_members
                 WHERE member_id = ?
                 LIMIT 1`,
                [memberId]
            );

            if (!rows.length) {
                return res.json({
                    type: "member",
                    valid: false,
                    message: "Invalid member ID."
                });
            }

            const member = rows[0];

            return res.json({
                type: "member",
                valid: true,
                message: "Valid ARSP Member",
                member: {
                    member_id: member.member_id,
                    full_name: member.full_name,
                    mobile: member.mobile || null
                }
            });
        }

        // ==========================================
        // TIRANGA CERTIFICATE QR
        // /arsp/tiranga/verify/TIRANGA-000001
        // ==========================================
        const tirangaMatch =
            pathname.match(/^\/arsp\/tiranga\/verify\/([^/]+)$/);

        if (tirangaMatch) {
            const certificateNo =
                decodeURIComponent(tirangaMatch[1]);

            const [rows] = await db.query(
                `SELECT
                    certificate_no,
                    full_name,
                    father_name,
                    village_name,
                    post_office,
                    police_station,
                    mobile,
                    issue_date
                 FROM tiranga_certificates
                 WHERE certificate_no = ?
                 LIMIT 1`,
                [certificateNo]
            );

            if (!rows.length) {
                return res.json({
                    type: "tiranga",
                    valid: false,
                    message: "Invalid Tiranga Certificate."
                });
            }

            const certificate = rows[0];

            return res.json({
                type: "tiranga",
                valid: true,
                message: "Valid Tiranga Certificate",
                certificate: {
                    certificate_no: certificate.certificate_no,
                    full_name: certificate.full_name,
                    father_name: certificate.father_name,
                    village_name: certificate.village_name,
                    post_office: certificate.post_office,
                    police_station: certificate.police_station,
                    mobile: certificate.mobile,
                    issue_date: certificate.issue_date
                }
            });
        }

        // ==========================================
        // APPOINTMENT LETTER QR
        // /arsp/document/verify/ARSP-APPT-...
        // ==========================================

        const documentMatch =
            pathname.match(
                /^\/arsp\/document\/verify\/(.+)$/
            );

        if (documentMatch) {
            const documentNumber =
                decodeURIComponent(documentMatch[1]);

            const verification =
                await ArspDocumentVerification
                    .getByDocumentNumber(documentNumber);

            if (!verification) {
                return res.json({
                    type: "appointment",
                    valid: false,
                    message: "Invalid appointment letter."
                });
            }

            const member =
                await ArspMember.getById(
                    verification.member_id
                );

            const status =
                String(
                    verification.status || "Valid"
                ).toLowerCase();

            const valid =
                status === "valid";

            return res.json({
                type: "appointment",
                valid,
                message: valid
                    ? "Valid Appointment Letter"
                    : "Invalid Appointment Letter",
                document_number:
                    verification.document_number,
                status:
                    verification.status || "Valid",
                member: member
                    ? {
                        member_id: member.member_id,
                        full_name: member.full_name
                    }
                    : null
            });
        }

        return res.status(400).json({
            valid: false,
            message: "This QR code is not an ARSP verification QR."
        });

    } catch (err) {
        console.error("ARSP Scanner Error:", err);

        return res.status(500).json({
            valid: false,
            message: "Verification service temporarily unavailable."
        });
    }
};

exports.tirangaVerifyPage = async (req, res) => {
    try {
        const certificateNo = String(req.params.certificateNo || "").trim();

        const [rows] = await db.query(
            `SELECT
                certificate_no,
                full_name,
                father_name,
                village_name,
                post_office,
                police_station,
                mobile,
                issue_date
             FROM tiranga_certificates
             WHERE certificate_no = ?
             LIMIT 1`,
            [certificateNo]
        );

        const certificate = rows[0] || null;

        const ArspSetting = require("../models/ArspSetting");
        const arsp = await ArspSetting.get();

        res.render("arsp/tiranga-verify", {
            title: certificate
                ? "Valid Tiranga Certificate"
                : "Invalid Tiranga Certificate",
            certificate,
            arsp
        });
    } catch (err) {
        console.error("Tiranga verification page error:", err);
        res.status(500).send("Unable to verify Tiranga Certificate.");
    }
};
