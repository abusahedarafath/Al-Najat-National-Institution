const db = require("../config/database");
const ArspMember = require("../models/ArspMember");
const ArspDocumentVerification = require("../models/ArspDocumentVerification");

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
