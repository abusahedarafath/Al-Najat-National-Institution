const ArspSchool = require("../models/ArspSchool");
const ArspSchoolAccount = require("../models/ArspSchoolAccount");
const RtseApplication = require("../models/RtseApplication");


// =====================================
// School Login Page
// =====================================
exports.loginPage = (req, res) => {
    if (req.session.arspSchool) {
        return res.redirect("/arsp/school/dashboard");
    }

    res.render("arsp/school-login", {
        title: "ARSP School Portal Login"
    });
};


// =====================================
// School Login
// =====================================
exports.login = async (req, res) => {
    try {
        const username = (req.body.username || "").trim();
        const password = req.body.password || "";

        if (!username || !password) {
            req.flash(
                "error",
                "Username and password are required."
            );

            return res.redirect("/arsp/school/login");
        }

        const account = await ArspSchoolAccount.login(
            username,
            password
        );

        if (!account) {
            req.flash(
                "error",
                "Invalid username or password."
            );

            return res.redirect("/arsp/school/login");
        }

        const school = await ArspSchool.getById(
            account.school_id
        );

        if (!school) {
            req.flash(
                "error",
                "School account is not connected to a valid school."
            );

            return res.redirect("/arsp/school/login");
        }

        if (school.status !== "Approved") {
            req.flash(
                "error",
                "This school account is not currently approved."
            );

            return res.redirect("/arsp/school/login");
        }

        await ArspSchoolAccount.updateLastLogin(
            account.id
        );

req.session.arspSchool = {
    account_id: account.id,
    school_id: school.id,
    username: account.username,
    school_code: school.school_code,
    school_name: school.school_name
};

        if (account.force_password_change == 1) {
            return res.redirect(
                "/arsp/school/change-password"
            );
        }

        return res.redirect(
            "/arsp/school/dashboard"
        );

    } catch (err) {
        console.error("ARSP School Login Error:", err);

        req.flash(
            "error",
            "Unable to login."
        );

        return res.redirect(
            "/arsp/school/login"
        );
    }
};


// =====================================
// School Dashboard
// =====================================
exports.dashboard = async (req, res) => {
    try {
        const schoolId = req.session?.arspSchool?.school_id;

        if (!schoolId) {
            return res.redirect("/arsp/school/login");
        }

        const school = await ArspSchool.getById(schoolId);

        if (!school) {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        const stats = await RtseApplication.getSchoolRtseStats(
            schoolId
        );


        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        return res.render("arsp/school-dashboard", {
            title: "RTSE Student Registry",
            school,
            stats
        });

    } catch (err) {
        console.error("ARSP School Dashboard Error:", err);
        return res.redirect("/arsp/school/login");
    }
};




// =====================================
// School RTSE Student Registration
// =====================================

exports.rtseRegisterPage = async (req, res) => {
    try {
        const schoolId = req.session?.arspSchool?.school_id;

        if (!schoolId) {
            return res.redirect("/arsp/school/login");
        }

        const school = await ArspSchool.getById(schoolId);

        if (!school) {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        return res.render("arsp/school-rtse-register", {
            title: "Register RTSE Student",
            school
        });

    } catch (err) {
        console.error("School RTSE Registration Page Error:", err);
        return res.redirect("/arsp/school/dashboard");
    }
};

exports.rtseRegister = async (req, res) => {
    try {
        const schoolId = req.session?.arspSchool?.school_id;

        if (!schoolId) {
            return res.redirect("/arsp/school/login");
        }

        const school = await ArspSchool.getById(schoolId);

        if (!school) {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        const files = req.files || {};

        const photo =
            files.photo?.[0]?.filename || null;

        const identityDocument =
            files.identity_document?.[0]?.filename || null;

        const {
            full_name,
            father_name,
            mother_name,
            gender,
            dob,
            mobile,
            email,
            district,
            state,
            pincode,
            class: studentClass,
            address
        } = req.body;

        if (
            !full_name ||
            !father_name ||
            !mother_name ||
            !gender ||
            !dob ||
            !mobile ||
            !studentClass ||
            !address ||
            !photo
        ) {
            req.flash(
                "error",
                "Please complete all required fields and upload both documents."
            );

            return res.redirect("/arsp/school/rtse-register");
        }

        const section =
            RtseApplication.getSection(studentClass);

        if (!section) {
            req.flash(
                "error",
                "Invalid RTSE class. Classes 4 to 10 are allowed."
            );

            return res.redirect("/arsp/school/rtse-register");
        }

        /*
         * IMPORTANT:
         * school_name is NEVER taken from req.body.
         * It is taken directly from the authenticated school.
         */
        const result = await RtseApplication.create({
            full_name,
            father_name,
            mother_name,
            gender,
            dob,
            mobile,
            email: email || "",
            school_name: school.school_name,
            school_id: school.id,
            district: district || school.district || "",
            state: state || school.state || "Assam",
            pincode: pincode || school.pincode || "",
            class: studentClass,
            address,
            photo,
            identity_document: identityDocument || null
        });

        req.flash(
            "success",
            `Student registered successfully. Registration No.: ${result.registration_no}`
        );

        return res.redirect("/arsp/school/rtse-students");

    } catch (err) {
        console.error("School RTSE Student Registration Error:", err);

        req.flash(
            "error",
            "Unable to register the RTSE student."
        );

        return res.redirect("/arsp/school/rtse-register");
    }
};


// =====================================
// View RTSE Student
// =====================================

exports.rtseStudentView = async (req, res) => {

    try {

        const schoolId =
            req.session?.arspSchool?.school_id;

        if (!schoolId) {
            return res.redirect("/arsp/school/login");
        }

        const school =
            await ArspSchool.getById(schoolId);

        if (!school) {

            req.session.arspSchool = null;

            return res.redirect(
                "/arsp/school/login"
            );
        }

        const studentId =
            Number(req.params.id);

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return res.status(400).send(
                "Invalid student ID."
            );
        }

        const student =
            await RtseApplication.getSchoolStudentById(
                studentId,
                schoolId
            );

        if (!student) {
            return res.status(404).send(
                "Student not found or does not belong to your school."
            );
        }

        return res.render(
            "arsp/school-rtse-student-view",
            {
                title: "View RTSE Student",
                school,
                student
            }
        );

    } catch (err) {

        console.error(
            "School RTSE student view error:",
            err
        );

        return res.status(500).send(
            "Unable to load student."
        );
    }
};


// =====================================
// Edit RTSE Student
// =====================================

exports.rtseStudentEdit = async (req, res) => {

    try {

        const schoolId =
            req.session?.arspSchool?.school_id;

        if (!schoolId) {
            return res.redirect("/arsp/school/login");
        }

        const school =
            await ArspSchool.getById(schoolId);

        if (!school) {

            req.session.arspSchool = null;

            return res.redirect(
                "/arsp/school/login"
            );
        }

        const studentId =
            Number(req.params.id);

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return res.status(400).send(
                "Invalid student ID."
            );
        }

        const student =
            await RtseApplication.getSchoolStudentById(
                studentId,
                schoolId
            );

        if (!student) {
            return res.status(404).send(
                "Student not found or does not belong to your school."
            );
        }

        return res.render(
            "arsp/school-rtse-student-edit",
            {
                title: "Edit RTSE Student",
                school,
                student,
                error: null
            }
        );

    } catch (err) {

        console.error(
            "School RTSE student edit page error:",
            err
        );

        return res.status(500).send(
            "Unable to load student."
        );
    }
};


// =====================================
// Update RTSE Student
// =====================================

exports.rtseStudentUpdate = async (req, res) => {

    try {

        const schoolId =
            req.session?.arspSchool?.school_id;

        if (!schoolId) {
            return res.redirect("/arsp/school/login");
        }

        const school =
            await ArspSchool.getById(schoolId);

        if (!school) {

            req.session.arspSchool = null;

            return res.redirect(
                "/arsp/school/login"
            );
        }

        const studentId =
            Number(req.params.id);

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return res.status(400).send(
                "Invalid student ID."
            );
        }

        /*
         * IMPORTANT:
         *
         * We first verify that this student belongs
         * to the authenticated school.
         *
         * school_id is taken from the session.
         * It is NEVER taken from req.body.
         */
        const existingStudent =
            await RtseApplication.getSchoolStudentById(
                studentId,
                schoolId
            );

        if (!existingStudent) {
            return res.status(404).send(
                "Student not found or does not belong to your school."
            );
        }

        const studentClass =
            Number(req.body.class);

        if (
            !Number.isInteger(studentClass) ||
            studentClass < 4 ||
            studentClass > 10
        ) {
            return res.status(400).send(
                "Invalid class."
            );
        }

        const section =
            RtseApplication.getSection(
                studentClass
            );

        const data = {

            full_name:
                String(req.body.full_name || "").trim(),

            father_name:
                String(req.body.father_name || "").trim(),

            mother_name:
                String(req.body.mother_name || "").trim(),

            gender:
                String(req.body.gender || "").trim(),

            dob:
                req.body.dob || null,

            mobile:
                String(req.body.mobile || "").trim(),

            email:
                String(req.body.email || "").trim(),

            /*
             * School information intentionally omitted.
             *
             * school_name and school_id remain exactly
             * as stored in the database.
             */

            district:
                String(req.body.district || "").trim(),

            state:
                String(req.body.state || "").trim(),

            pincode:
                String(req.body.pincode || "").trim(),

            class:
                studentClass,

            section,

            address:
                String(req.body.address || "").trim()
        };

        if (!data.full_name) {
            return res.status(400).send(
                "Student name is required."
            );
        }

        const updated =
            await RtseApplication.updateSchoolStudent(
                studentId,
                schoolId,
                data
            );

        if (!updated) {
            return res.status(404).send(
                "Student could not be updated."
            );
        }

        return res.redirect(
            `/arsp/school/rtse-students/${studentId}`
        );

    } catch (err) {

        console.error(
            "School RTSE student update error:",
            err
        );

        return res.status(500).send(
            "Unable to update student."
        );
    }
};


// =====================================
// School RTSE Student Registry
// =====================================
exports.rtseStudents = async (req, res) => {
    try {
        const schoolId = req.session?.arspSchool?.school_id;

        if (!schoolId) {
            return res.redirect("/arsp/school/login");
        }

        const school = await ArspSchool.getById(schoolId);

        if (!school) {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        const search = String(req.query.search || "").trim();
        const status = String(req.query.status || "").trim();
        const section = String(req.query.section || "").trim().toUpperCase();

        const students = await RtseApplication.getSchoolStudents(
            schoolId,
            search,
            status,
            section
        );

        const stats = await RtseApplication.getSchoolRtseStats(
            schoolId
        );

        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        return res.render("arsp/school-rtse-students", {
            title: "RTSE Student Registry",
            school,
            students,
            stats,
            search,
            status,
            section
        });

    } catch (err) {
        console.error("School RTSE Student Registry Error:", err);
        req.flash("error", "Unable to load RTSE Student Registry.");
        return res.redirect("/arsp/school/dashboard");
    }
};

// =====================================
// Change Password Page
// =====================================
exports.changePasswordPage = async (req, res) => {
    try {
        const school = await ArspSchool.getById(
            req.session.arspSchool.school_id
        );

        if (!school) {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        res.render("arsp/school-change-password", {
            title: "Change School Portal Password",
            school
        });

    } catch (err) {
        console.error(err);

        return res.redirect(
            "/arsp/school/login"
        );
    }
};


// =====================================
// Change Password
// =====================================
exports.changePassword = async (req, res) => {
    try {
        const {
            new_password,
            confirm_password
        } = req.body;

        if (!new_password || new_password.length < 8) {
            req.flash(
                "error",
                "Password must be at least 8 characters."
            );

            return res.redirect(
                "/arsp/school/change-password"
            );
        }

        if (new_password !== confirm_password) {
            req.flash(
                "error",
                "Passwords do not match."
            );

            return res.redirect(
                "/arsp/school/change-password"
            );
        }

        await ArspSchoolAccount.updatePassword(
            req.session.arspSchool.account_id,
            new_password
        );

        req.flash(
            "success",
            "Password changed successfully."
        );

        return res.redirect(
            "/arsp/school/dashboard"
        );

    } catch (err) {
        console.error(
            "ARSP School Password Change Error:",
            err
        );

        req.flash(
            "error",
            "Unable to change password."
        );

        return res.redirect(
            "/arsp/school/change-password"
        );
    }
};


// =====================================
// Logout
// =====================================
exports.logout = (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    req.session.destroy((err) => {
        res.clearCookie("connect.sid", {
            path: "/"
        });

        if (err) {
            console.error("ARSP School Logout Error:", err);
        }

        return res.redirect("/arsp/school/login");
    });
};


// =====================================
// Credential Slip
// =====================================
exports.credentialSlip = async (req, res) => {
    try {
        const credentials =
            req.session.arspSchoolCredentialSlip;

        if (!credentials) {
            return res.status(404).render(
                "errors/404"
            );
        }

        const school = await ArspSchool.getById(
            credentials.school_id
        );

        if (!school) {
            delete req.session.arspSchoolCredentialSlip;

            return res.status(404).render(
                "errors/404"
            );
        }

        res.render(
            "admin/arsp/schools/credential-slip",
            {
                title: "School Portal Credential Slip",
                school,
                credentials,
                portalUrl: `${req.protocol}://${req.get("host")}/arsp/school/login`
            }
        );

        // Keep it available for browser refresh/printing
        // during this session.
        // It is removed when the admin explicitly leaves
        // the credential slip workflow.

    } catch (err) {
        console.error(
            "School Credential Slip Error:",
            err
        );

        return res.status(500).send(
            "Unable to generate credential slip."
        );
    }
};


// =====================================
// Close Credential Slip
// =====================================
exports.closeCredentialSlip = (req, res) => {
    delete req.session.arspSchoolCredentialSlip;

    return res.redirect(
        "/admin/arsp/schools"
    );
};
