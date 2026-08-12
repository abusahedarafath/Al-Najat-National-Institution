const RtseApplication = require("../models/RtseApplication");

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

        return res.render(
            "rtse/student-dashboard",
            {
                title: "RTSE Student Dashboard",
                application
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
