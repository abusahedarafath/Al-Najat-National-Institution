const RtseApplication = require("../models/RtseApplication");
const RtseResult = require("../models/RtseResult");
const RtseCertificate = require("../models/RtseCertificate");
const RtseSetting = require("../models/RtseSetting");
const RtseExamSetting = require("../models/RtseExamSetting");
const RtseCentre = require("../models/RtseCentre");
const RtseExamAttendance = require("../models/RtseExamAttendance");
const QRCode = require("qrcode");

// =====================================
// RTSE STUDENT LOGIN PAGE
// =====================================

exports.loginPage = (req, res) => {

    if (req.session && req.session.rtseStudent) {
        return res.redirect("/rtse/student/dashboard");
    }

    res.render("rtse/student-login", {
        title: "RTSE Student Login",
        error: null
    });

};


// =====================================
// RTSE STUDENT LOGIN
// Registration Number + Mobile Number
// =====================================

exports.login = async (req, res) => {

    try {

        const registrationNo =
            String(req.body.registration_no || "").trim();

        const mobile =
            String(req.body.mobile || "").trim();

        if (!registrationNo || !mobile) {

            return res.status(400).render(
                "rtse/student-login",
                {
                    title: "RTSE Student Login",
                    error:
                        "Registration Number and Mobile Number are required."
                }
            );

        }

        const application =
            await RtseApplication.getByRegistrationAndMobile(
                registrationNo,
                mobile
            );

        if (!application) {

            return res.status(401).render(
                "rtse/student-login",
                {
                    title: "RTSE Student Login",
                    error:
                        "Invalid Registration Number or Mobile Number."
                }
            );

        }

        // =====================================
        // CREATE RTSE STUDENT SESSION
        // =====================================

        req.session.rtseStudent = {

            id: application.id,

            registration_no:
                application.registration_no,

            full_name:
                application.full_name,

            mobile:
                application.mobile

        };

        req.session.save((sessionError) => {

            if (sessionError) {

                console.error(
                    "RTSE student session error:",
                    sessionError
                );

                return res.status(500).render(
                    "rtse/student-login",
                    {
                        title: "RTSE Student Login",
                        error:
                            "Unable to create your login session."
                    }
                );

            }

            return res.redirect(
                "/rtse/student/dashboard"
            );

        });

    } catch (error) {

        console.error(
            "RTSE student login error:",
            error
        );

        return res.status(500).render(
            "rtse/student-login",
            {
                title: "RTSE Student Login",
                error:
                    "Unable to process login. Please try again."
            }
        );

    }

};


// =====================================
// RTSE STUDENT DASHBOARD
// =====================================

exports.dashboard = async (req, res) => {

    try {

        if (
            !req.session ||
            !req.session.rtseStudent
        ) {

            return res.redirect(
                "/rtse/student/login"
            );

        }

        // Prevent browser / WebView from displaying
        // an old dashboard response.
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        // Always fetch the CURRENT application record
        // directly from the database using the application
        // ID stored when the student authenticated.
        const application =
            await RtseApplication.getById(
                req.session.rtseStudent.id
            );

        if (!application) {

            req.session.destroy(() => {

                return res.redirect(
                    "/rtse/student/login"
                );

            });

            return;

        }

        // Admit Card visibility is controlled by the official
        // RTSE publication setting. Generated != published.
        const rtseSetting = await RtseSetting.get();

        return res.render(
            "rtse/student-dashboard",
            {
                title: "RTSE Student Dashboard",
                application,
                rtseSetting
            }
        );

    } catch (error) {

        console.error(
            "RTSE student dashboard error:",
            error
        );

        return res.status(500).send(
            "Unable to load RTSE student dashboard."
        );

    }

};


// =====================================
// APPROVED RTSE EXAMINATION SLIP
// =====================================

exports.approvedSlip = async (req, res) => {

    try {

        if (
            !req.session ||
            !req.session.rtseStudent ||
            !req.session.rtseStudent.id
        ) {
            return res.redirect("/rtse/student/login");
        }

        // Always fetch the CURRENT application from the database.
        const application =
            await RtseApplication.getById(
                req.session.rtseStudent.id
            );

        if (!application) {

            return res.redirect(
                "/rtse/student/dashboard"
            );

        }

        // Approved Slip is available ONLY after approval.
        if (
            String(application.status || "")
                .trim()
                .toLowerCase() !== "approved"
        ) {

            return res.redirect(
                "/rtse/student/dashboard"
            );

        }

        return res.render(
            "rtse/approved-slip",
            {
                title: "Approved RTSE Examination Slip",
                application
            }
        );

    } catch (error) {

        console.error(
            "RTSE approved slip error:",
            error
        );

        return res.status(500).send(
            "Unable to load the approved examination slip."
        );

    }

};


// =====================================
// PRIVATE RTSE STUDENT REGISTRATION SLIP
// =====================================

exports.registrationSlip = async (req, res) => {

    try {

        if (
            !req.session ||
            !req.session.rtseStudent ||
            !req.session.rtseStudent.id
        ) {
            return res.redirect("/rtse/student/login");
        }

        const application = await RtseApplication.getById(
            req.session.rtseStudent.id
        );

        if (!application) {
            return res.redirect("/rtse/student/login");
        }

        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        return res.render(
            "rtse/acknowledgement",
            {
                title: "RTSE Registration Slip",
                application
            }
        );

    } catch (error) {

        console.error(
            "RTSE student registration slip error:",
            error
        );

        return res.status(500).send(
            "Unable to load your RTSE registration slip."
        );

    }

};


// =====================================
// PRIVATE RTSE STUDENT RESULT
// =====================================

exports.result = async (req, res) => {

    try {

        if (
            !req.session ||
            !req.session.rtseStudent ||
            !req.session.rtseStudent.id
        ) {
            return res.redirect("/rtse/student/login");
        }

        const applicationId =
            req.session.rtseStudent.id;

        const student =
            await RtseResult.getByApplication(applicationId);

        const examSetting =
            await RtseExamSetting.get();

        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        if (!student) {

            return res.render(
                "rtse/student-result",
                {
                    title: "RTSE Result",
                    examSetting,
                    student: null
                }
            );

        }

        return res.render(
            "rtse/result-view",
            {
                title: "RTSE Result",
                examSetting,
                student
            }
        );

    } catch (error) {

        console.error(
            "RTSE student result error:",
            error
        );

        return res.status(500).send(
            "Unable to load your RTSE result."
        );

    }

};


// =====================================
// PRIVATE RTSE STUDENT CERTIFICATE
// =====================================

exports.certificate = async (req, res) => {

    try {

        if (
            !req.session ||
            !req.session.rtseStudent ||
            !req.session.rtseStudent.id
        ) {
            return res.redirect("/rtse/student/login");
        }

        const applicationId =
            req.session.rtseStudent.id;

        const setting =
            await RtseSetting.get();

        if (!setting || !setting.certificate_publish) {

            return res.render(
                "rtse/student-certificate",
                {
                    title: "RTSE Certificate",
                    setting,
                    certificate: null,
                    error:
                        "Certificates have not been published yet."
                }
            );

        }

        const certificate =
            await RtseCertificate.getByApplication(
                applicationId
            );

        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        if (!certificate) {

            return res.render(
                "rtse/student-certificate",
                {
                    title: "RTSE Certificate",
                    setting,
                    certificate: null,
                    error:
                        "Your RTSE certificate is not available yet."
                }
            );

        }

        return res.render(
            "rtse/certificate",
            {
                title: "RTSE Certificate",
                setting,
                certificate
            }
        );

    } catch (error) {

        console.error(
            "RTSE student certificate error:",
            error
        );

        return res.status(500).send(
            "Unable to load your RTSE certificate."
        );

    }

};



// =====================================
// PRIVATE RTSE STUDENT ADMIT CARD
// =====================================

exports.admitCard = async (req, res) => {

    try {

        if (
            !req.session ||
            !req.session.rtseStudent ||
            !req.session.rtseStudent.id
        ) {
            return res.redirect("/rtse/student/login");
        }

        const application =
            await RtseApplication.getById(
                req.session.rtseStudent.id
            );

        if (!application) {
            return res.redirect("/rtse/student/login");
        }

        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        const ArspSetting =
            require("../models/ArspSetting");

        const arspSetting =
            await ArspSetting.get();

        const examSetting =
            await RtseExamSetting.get();

        // Resolve the student's examination shift from the
        // shift-wise sections configured under Examination Settings.
        // The admit card must not depend on seat-plan shift assignment.
        let examShift = null;
        if (examSetting && application.section) {
            const configuredShifts =
                await RtseExamSetting.getShifts(examSetting.id);

            const studentSection =
                String(application.section).trim().toUpperCase();

            examShift = configuredShifts.find((shift) =>
                Array.isArray(shift.sections) &&
                shift.sections.some((section) =>
                    String(section.section || "").trim().toUpperCase() ===
                    studentSection
                )
            ) || null;
        }

        // Resolve the examination centre from the student's
        // registered school and its approved centre assignment.
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

        // Admit card must be generated for this student.
        if (
            Number(application.admit_generated) !== 1 ||
            String(application.status || "").trim().toLowerCase() !== "approved"
        ) {
            return res.render(
                "rtse/student-admit-card",
                {
                    title: "RTSE Admit Card",
                    setting: arspSetting,
                    student: application,
                    attendance: null,
                    qrData: null,
                    examSetting,
                    examShift,
                    examCentre,
                                              examYear:
                                                  examSetting?.exam_year ||
                                                  arspSetting?.exam_year ||
                                                  new Date().getFullYear(),
                    error: "Your admit card has not been generated yet."
                }
            );
        }

        // Admit cards must be officially published.
        const setting =
            await RtseSetting.get();

        if (!setting || Number(setting.admit_publish) !== 1) {

            return res.render(
                "rtse/student-admit-card",
                {
                    title: "RTSE Admit Card",
                    setting: arspSetting,
                    student: application,
                    attendance: null,
                    qrData: null,
                examSetting,
                examShift,
                examCentre,
                                              examYear:
                                                  examSetting?.exam_year ||
                                                  arspSetting?.exam_year ||
                                                  new Date().getFullYear(),
                    error: "Admit cards have not been published yet."
                }
            );
        }

        // Reuse the existing attendance QR system.
        let attendance = null;

        if (
            application.roll_no
        ) {
            attendance =
                await RtseExamAttendance.ensureForApplication(
                    application.id
                );
        }

        let qrData = null;

        if (attendance && attendance.qr_token) {

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

        return res.render(
            "rtse/student-admit-card",
            {
                title: "RTSE Admit Card",
                setting: arspSetting,
                student: application,
                attendance,
                qrData,
                examSetting,
                examShift,
                examCentre,
                                                    examYear:
                                                        examSetting?.exam_year ||
                                                        arspSetting?.exam_year ||
                                                        new Date().getFullYear(),
                error: null
            }
        );

    } catch (error) {

        console.error(
            "RTSE student admit card error:",
            error
        );

        return res.status(500).send(
            "Unable to load your RTSE admit card."
        );

    }

};

// =====================================
// RTSE STUDENT LOGOUT
// =====================================

exports.logout = (req, res) => {

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    req.session.destroy((err) => {

        res.clearCookie("connect.sid", {
            path: "/"
        });

        if (err) {
            console.error("RTSE student logout session error:", err);
        }

        return res.redirect("/rtse/student/login");
    });
};
