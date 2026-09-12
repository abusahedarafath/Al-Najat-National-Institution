const RtseApplication = require("../models/RtseApplication");
const ArspMember = require("../models/ArspMember");
const RtseSetting = require("../models/RtseSetting");
const RtseExamSetting = require("../models/RtseExamSetting");
const RtseCentre = require("../models/RtseCentre");
const RtseAdmitCardSetting = require("../models/RtseAdmitCardSetting");
const RtseExamAttendance = require("../models/RtseExamAttendance");
const ArspSetting = require("../models/ArspSetting");
const ArspAdmitDownload = require("../models/ArspAdmitDownload");
const QRCode = require("qrcode");


// =====================================================
// ARSP MEMBER — STUDENT ADMIT CARD DOWNLOAD
// =====================================================

exports.download = async (req, res) => {

    try {

        if (
            !req.session ||
            !req.session.arspMember ||
            !req.session.arspMember.id
        ) {
            return res.status(401).json({
                success: false,
                message: "ARSP member login required."
            });
        }


        const registrationNo =
            String(req.body?.registration_no || "").trim();

        const mobile =
            String(req.body?.mobile || "").trim();

        const verificationMode =
            String(
                req.body?.verification_mode || ""
            ).trim();


        if (!registrationNo || !mobile) {

            return res.status(400).json({
                success: false,
                message:
                    "Registration number and registered mobile number are required."
            });

        }


        // =================================================
        // =================================================
        // SERVER-SIDE ACCESS + STUDENT VERIFICATION
        //
        // Partial Access:
        // Registration number + student's registered mobile.
        //
        // Full Access:
        // Registration number + logged-in member's own
        // registered mobile.
        //
        // Access is always read from the database.
        // The browser is never trusted for authorization.
        // =================================================

        const authSessionMember =
            req.session.arspMember;

        const authMember =
            await ArspMember.getById(
                authSessionMember.id
            );

        if (!authMember) {

            return res.status(403).json({
                success: false,
                message:
                    "ARSP member account could not be verified."
            });

        }

        const access =
            String(
                authMember.admit_card_access || "Partial"
            ).trim();


        let application = null;


        if (access === "Full") {

            // Full Access can ONLY use member-mobile verification.
            if (verificationMode !== "member") {
                return res.status(403).json({
                    success: false,
                    message:
                        "Full Access requires verification with your registered ARSP member mobile number."
                });
            }

            // Full Access requires the mobile number
            // registered to the logged-in ARSP member.

            const memberMobile =
                String(
                    authMember.mobile || ""
                ).replace(/\D/g, "");

            const submittedMobile =
                mobile.replace(/\D/g, "");


            if (
                !memberMobile ||
                !submittedMobile ||
                memberMobile !== submittedMobile
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Your registered member mobile number does not match."
                });

            }


            // Only after the member's own mobile has
            // been verified do we retrieve the student.

            application =
                await RtseApplication.getByRegistrationOnly(
                    registrationNo
                );


        } else {

            // Partial Access preserves the existing
            // student-mobile verification workflow.

            // Partial Access can ONLY use student-mobile verification.
            if (verificationMode !== "student") {
                return res.status(403).json({
                    success: false,
                    message:
                        "Partial Access requires verification with the selected student's registered mobile number."
                });
            }

            // Verify the selected student's own
            // registered mobile number.
            application =
                await RtseApplication.getByRegistrationAndMobile(
                    registrationNo,
                    mobile
                );

        }


        if (!application) {

            return res.status(403).json({
                success: false,
                message:
                    access === "Full"
                        ? "Student registration number could not be verified."
                        : "The selected student registered mobile number does not match."
            });

        }


        // =================================================
        // EXISTING RTSE ADMIT CARD SETTINGS
        // =================================================

        const arspSetting =
            await ArspSetting.get();

        const examSetting =
            await RtseExamSetting.get();

        const admitCardSetting =
            await RtseAdmitCardSetting.get();


        // =================================================
        // RESOLVE EXAMINATION SHIFT
        // Same existing RTSE logic
        // =================================================

        let examShift = null;

        if (
            examSetting &&
            application.section
        ) {

            const configuredShifts =
                await RtseExamSetting.getShifts(
                    examSetting.id
                );

            const studentSection =
                String(application.section)
                    .trim()
                    .toUpperCase();


            examShift =
                configuredShifts.find((shift) =>
                    Array.isArray(shift.sections) &&
                    shift.sections.some((section) =>
                        String(section.section || "")
                            .trim()
                            .toUpperCase() ===
                        studentSection
                    )
                ) || null;

        }


        // =================================================
        // RESOLVE EXAMINATION CENTRE
        // =================================================

        let examCentre = null;

        if (
            application.school_id &&
            application.application_year
        ) {

            examCentre =
                await RtseCentre.getSchoolAssignment(
                    application.school_id,
                    application.application_year
                );

        }


        // =================================================
        // ADMIT CARD MUST BE GENERATED + APPROVED
        // =================================================

        if (
            Number(application.admit_generated) !== 1 ||
            String(application.status || "")
                .trim()
                .toLowerCase() !== "approved"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Your admit card has not been generated yet."
            });

        }


        // =================================================
        // ADMIT CARD MUST BE PUBLISHED
        // =================================================

        const setting =
            await RtseSetting.get();


        if (
            !setting ||
            Number(setting.admit_publish) !== 1
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Admit cards have not been published yet."
            });

        }


        // =================================================
        // EXISTING ATTENDANCE QR SYSTEM
        // =================================================

        let attendance = null;

        if (application.roll_no) {

            attendance =
                await RtseExamAttendance.ensureForApplication(
                    application.id
                );

        }


        let qrData = null;

        if (
            attendance &&
            attendance.qr_token
        ) {

            qrData =
                await QRCode.toDataURL(
                    attendance.qr_token,
                    {
                        width: 180,
                        margin: 2,
                        errorCorrectionLevel: "M"
                    }
                );

        }


        // =================================================
        // CURRENT ARSP MEMBER
        // =================================================

        const sessionMember =
            req.session.arspMember;

        if (!sessionMember || !sessionMember.id) {
            return res.status(401).json({
                success: false,
                message:
                    "ARSP member login required."
            });
        }

        // Fetch the current registered member record.
        // The login session intentionally contains only
        // a limited member snapshot.
        const member =
            await ArspMember.getById(
                sessionMember.id
            );

        if (!member) {
            return res.status(403).json({
                success: false,
                message:
                    "ARSP member information could not be verified."
            });
        }

        const memberId =
            String(
                member.member_id ||
                sessionMember.member_id ||
                member.id ||
                ""
            ).trim();

        const memberName =
            String(
                member.full_name ||
                member.name ||
                sessionMember.name ||
                ""
            ).trim();

        const memberEmail =
            String(
                member.email ||
                ""
            ).trim();

        const memberMobile =
            String(
                member.mobile ||
                ""
            ).trim();

        const designation =
            String(
                member.designation ||
                member.position ||
                member.post ||
                ""
            ).trim();

        if (!memberId || !memberName) {
            return res.status(403).json({
                success: false,
                message:
                    "ARSP member information could not be verified."
            });
        }
        await ArspAdmitDownload.create({
            applicationId:
                application.id,

            registrationNo:
                application.registration_no,

            studentName:
                application.full_name,

            schoolName:
                application.school_name || null,

            fatherName:
                application.father_name || null,

            studentClass:
                application.class || null,

            section:
                application.section || null,

            memberId,
            memberName,

            designation:
                designation || null,

            memberEmail:
                memberEmail || null,

            memberMobile:
                memberMobile || null,

            examYear:
                examSetting?.exam_year ||
                arspSetting?.exam_year ||
                new Date().getFullYear(),

            examShift:
                examShift?.name ||
                examShift?.shift ||
                examShift?.title ||
                null,

            examCentre:
                examCentre?.name ||
                examCentre?.centre_name ||
                examCentre?.center_name ||
                null,

            verifiedAt:
                new Date(),

            ipAddress:
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                null,

            userAgent:
                req.get("user-agent") ||
                null
        });


        // =================================================
        // RENDER THE EXISTING PRODUCTION ADMIT CARD DESIGN
        // No changes to student-admit-card.ejs.
        // =================================================

        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );

        res.setHeader(
            "Pragma",
            "no-cache"
        );

        res.setHeader(
            "Expires",
            "0"
        );


        return res.render(
            "rtse/student-admit-card",
            {

                title:
                    "RTSE Admit Card",

                setting:
                    arspSetting,

                student:
                    application,

                attendance,

                qrData,

                examSetting,

                examShift,

                examCentre,

                admitCardSetting,

                examYear:
                    examSetting?.exam_year ||
                    arspSetting?.exam_year ||
                    new Date().getFullYear(),

                error:
                    null

            }
        );


    } catch (error) {

        console.error(
            "ARSP member admit-card download error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to download admit card."
        });

    }

};


module.exports = exports;
