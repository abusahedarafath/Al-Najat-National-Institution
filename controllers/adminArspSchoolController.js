const ArspSchool = require("../models/ArspSchool");
const ArspSchoolAccount = require("../models/ArspSchoolAccount");

// =====================================
// School Registry Dashboard
// =====================================
exports.index = async (req, res) => {
    try {
        const search = req.query.search || "";
        const status = req.query.status || "";

        const schools = await ArspSchool.getAll(search, status);
        const counts = await ArspSchool.getDashboardCounts();

        res.render("admin/arsp/schools/index", {
            title: "ARSP School Registry",
            schools,
            counts,
            search,
            status
        });
    } catch (err) {
        console.error("ARSP School Registry Error:", err);

        req.flash("error", "Unable to load School Registry.");
        res.redirect("/admin/arsp");
    }
};

// =====================================
// Add School Page
// =====================================
exports.addPage = (req, res) => {
    res.render("admin/arsp/schools/form", {
        title: "Add ARSP School",
        school: {},
        isEdit: false
    });
};

// =====================================
// Create School
// =====================================
exports.create = async (req, res) => {
    try {
        if (!req.body.school_name || !req.body.school_name.trim()) {
            req.flash("error", "School name is required.");
            return res.redirect("/admin/arsp/schools/add");
        }

        const result = await ArspSchool.create({
            school_name: req.body.school_name.trim(),
            school_type: req.body.school_type || "School",
            head_name: req.body.head_name || null,
            mobile: req.body.mobile || null,
            email: req.body.email || null,
            address: req.body.address || null,
            village: req.body.village || null,
            post_office: req.body.post_office || null,
            district: req.body.district || null,
            state: req.body.state || "Assam",
            pincode: req.body.pincode || null,
            remarks: req.body.remarks || null,

            // Logged-in admin database ID
            created_by: req.session.user.id,

            // New schools enter approval workflow
            status: "Pending"
        });

        req.flash(
            "success",
            `School registered successfully. School Code: ${result.school_code}`
        );

        return res.redirect(`/admin/arsp/school/${result.id}`);
    } catch (err) {
        console.error("ARSP School Create Error:", err);

        req.flash(
            "error",
            err.code === "ER_DUP_ENTRY"
                ? "A school with this information already exists."
                : "Unable to register school."
        );

        return res.redirect("/admin/arsp/schools/add");
    }
};

// =====================================
// View School
// =====================================
exports.view = async (req, res) => {
    try {
        const school = await ArspSchool.getById(req.params.id);

        if (!school) {
            req.flash("error", "School not found.");
            return res.redirect("/admin/arsp/schools");
        }

        res.render("admin/arsp/schools/view", {
            title: "School Profile",
            school
        });
    } catch (err) {
        console.error("ARSP School View Error:", err);

        req.flash("error", "Unable to load school.");
        res.redirect("/admin/arsp/schools");
    }
};

// =====================================
// Edit School Page
// =====================================
exports.editPage = async (req, res) => {
    try {
        const school = await ArspSchool.getById(req.params.id);

        if (!school) {
            req.flash("error", "School not found.");
            return res.redirect("/admin/arsp/schools");
        }

        res.render("admin/arsp/schools/form", {
            title: "Edit ARSP School",
            school,
            isEdit: true
        });
    } catch (err) {
        console.error("ARSP School Edit Page Error:", err);

        req.flash("error", "Unable to load school.");
        res.redirect("/admin/arsp/schools");
    }
};

// =====================================
// Update School
// =====================================
exports.update = async (req, res) => {
    try {
        const school = await ArspSchool.getById(req.params.id);

        if (!school) {
            req.flash("error", "School not found.");
            return res.redirect("/admin/arsp/schools");
        }

        await ArspSchool.update(req.params.id, {
            school_name: req.body.school_name,
            school_type: req.body.school_type,
            head_name: req.body.head_name,
            mobile: req.body.mobile,
            email: req.body.email,
            address: req.body.address,
            village: req.body.village,
            post_office: req.body.post_office,
            district: req.body.district,
            state: req.body.state,
            pincode: req.body.pincode,
            remarks: req.body.remarks
        });

        req.flash("success", "School information updated successfully.");

        return res.redirect(`/admin/arsp/school/${req.params.id}`);
    } catch (err) {
        console.error("ARSP School Update Error:", err);

        req.flash("error", "Unable to update school.");
        return res.redirect(`/admin/arsp/school/${req.params.id}/edit`);
    }
};

// =====================================
// Approve School
// =====================================
exports.approve = async (req, res) => {
    try {
        const school = await ArspSchool.getById(req.params.id);

        if (!school) {
            req.flash("error", "School not found.");
            return res.redirect("/admin/arsp/schools");
        }

        if (school.status === "Approved") {
            req.flash("info", "School is already approved.");
            return res.redirect(`/admin/arsp/school/${req.params.id}`);
        }

        await ArspSchool.approve(
            req.params.id,
            req.session.user.id
        );

        // =====================================
        // Create School Portal Account
        // =====================================
        let account =
            await ArspSchoolAccount.getBySchoolId(
                school.id
            );

        let temporaryPassword = null;

        if (!account) {
            const created =
                await ArspSchoolAccount.create(
                    school.id,
                    school.school_code
                );

            account = created;
            temporaryPassword =
                created.temporaryPassword;
        } else {
            // Existing account: do not reset its password
            // during normal approval.
            temporaryPassword = null;
        }

        // =====================================
        // Store Credential Slip Data
        // =====================================
        req.session.arspSchoolCredentialSlip = {
            school_id: school.id,
            username: account.username || school.school_code,
            temporaryPassword,
            generatedAt: new Date().toISOString()
        };

        req.flash(
            "success",
            "School approved and School Portal account created successfully."
        );

        return res.redirect(
            `/admin/arsp/school/${school.id}/credential-slip`
        );

    } catch (err) {
        console.error(
            "ARSP School Approval Error:",
            err
        );

        req.flash(
            "error",
            "Unable to approve school."
        );

        return res.redirect(
            `/admin/arsp/school/${req.params.id}`
        );
    }
};

// =====================================
// Reject School
// =====================================
exports.reject = async (req, res) => {
    try {
        const school = await ArspSchool.getById(req.params.id);

        if (!school) {
            req.flash("error", "School not found.");
            return res.redirect("/admin/arsp/schools");
        }

        await ArspSchool.reject(
            req.params.id,
            req.body.remarks || "Rejected by administrator.",
            req.session.user.id
        );

        req.flash("success", "School rejected successfully.");
    } catch (err) {
        console.error("ARSP School Rejection Error:", err);
        req.flash("error", "Unable to reject school.");
    }

    return res.redirect(`/admin/arsp/school/${req.params.id}`);
};

// =====================================
// Deactivate School
// =====================================
exports.deactivate = async (req, res) => {
    try {
        await ArspSchool.deactivate(req.params.id);

        req.flash("success", "School has been set to inactive.");
    } catch (err) {
        console.error("ARSP School Deactivate Error:", err);
        req.flash("error", "Unable to deactivate school.");
    }

    return res.redirect(`/admin/arsp/school/${req.params.id}`);
};

// =====================================
// Activate School
// =====================================
exports.activate = async (req, res) => {
    try {
        await ArspSchool.activate(req.params.id);

        req.flash("success", "School has been activated successfully.");
    } catch (err) {
        console.error("ARSP School Activate Error:", err);
        req.flash("error", "Unable to activate school.");
    }

    return res.redirect(`/admin/arsp/school/${req.params.id}`);
};


// =====================================
// Reset School Portal Password
// =====================================
exports.resetPortalPassword = async (req, res) => {
    try {
        const school = await ArspSchool.getById(req.params.id);

        if (!school) {
            req.flash("error", "School not found.");
            return res.redirect("/admin/arsp/schools");
        }

        const credentials =
            await ArspSchoolAccount.resetPassword(school.id);

        if (!credentials) {
            req.flash(
                "error",
                "No School Portal account exists for this school."
            );

            return res.redirect(
                `/admin/arsp/school/${school.id}`
            );
        }

        req.session.arspSchoolCredentialSlip = {
            school_id: school.id,
            username: credentials.username,
            temporaryPassword: credentials.temporaryPassword,
            generatedAt: new Date().toISOString()
        };

        req.flash(
            "success",
            "School Portal password reset successfully."
        );

        return res.redirect(
            `/admin/arsp/school/${school.id}/credential-slip`
        );

    } catch (err) {
        console.error(
            "ARSP School Password Reset Error:",
            err
        );

        req.flash(
            "error",
            "Unable to reset School Portal password."
        );

        return res.redirect(
            `/admin/arsp/school/${req.params.id}`
        );
    }
};
