const ArspSetting = require("../models/ArspSetting");
const ArspSchool = require("../models/ArspSchool");

// =====================================
// Public School Registration Page
// =====================================

exports.registerPage = async (req, res) => {
    try {
        const setting = await ArspSetting.get();

        const old =
            req.session.arspSchoolRegistrationReview?.data || {};

        return res.render("arsp/school-register", {
            title: "School Registration | Active Rural Social Progress",
            setting,
            old
        });

    } catch (err) {
        console.error("ARSP Public School Registration Page Error:", err);

        try {
            const setting = await ArspSetting.get();

            return res.render("arsp/school-register", {
                title: "School Registration | Active Rural Social Progress",
                setting,
                old: {},
                error: err.message
            });

        } catch (settingError) {
            console.error(settingError);

            return res.status(500).send(
                "Unable to load school registration form."
            );
        }
    }
};


// =====================================
// Review School Registration
// =====================================

exports.review = async (req, res) => {
    try {
        const setting = await ArspSetting.get();

        const data = {
            school_name: req.body.school_name || "",
            school_type: req.body.school_type || "School",

            head_name: req.body.head_name || "",

            mobile: req.body.mobile || "",
            email: req.body.email || "",

            address: req.body.address || "",
            village: req.body.village || "",
            post_office: req.body.post_office || "",

            district: req.body.district || "",
            state: req.body.state || "Assam",
            pincode: req.body.pincode || ""
        };

        // Basic server-side validation
        if (!data.school_name.trim()) {
            req.flash("error", "School name is required.");
            return res.redirect("/arsp/school/register");
        }

        if (!data.district.trim()) {
            req.flash("error", "District is required.");
            return res.redirect("/arsp/school/register");
        }

        req.session.arspSchoolRegistrationReview = {
            data
        };

        req.session.save((sessionError) => {
            if (sessionError) {
                console.error(
                    "ARSP School Review Session Error:",
                    sessionError
                );

                req.flash(
                    "error",
                    "Unable to prepare your school application for review."
                );

                return res.redirect("/arsp/school/register");
            }

            return res.render("arsp/school-register-review", {
                title: "Review School Registration",
                setting,
                data
            });
        });

    } catch (err) {
        console.error(
            "ARSP Public School Review Error:",
            err
        );

        req.flash("error", err.message);

        return res.redirect("/arsp/school/register");
    }
};


// =====================================
// Confirm School Registration
// =====================================

exports.confirm = async (req, res) => {
    try {
        const review =
            req.session.arspSchoolRegistrationReview;

        const setting = await ArspSetting.get();

        // Prevent direct confirmation
        if (!review || !review.data) {
            req.flash(
                "error",
                "Your review session has expired. Please complete the form again."
            );

            return res.redirect("/arsp/school/register");
        }

        const data = review.data;

        // Create as Pending ONLY.
        const result = await ArspSchool.create({
            ...data,
            status: "Pending",
            created_by: null
        });

        const school =
            await ArspSchool.getById(result.id);

        delete req.session.arspSchoolRegistrationReview;

        req.session.lastArspSchoolRegistration = {
            schoolId: school.id,
            schoolCode: school.school_code
        };

        return res.render(
            "arsp/school-registration-success",
            {
                title: "School Registration Submitted",
                setting,
                school
            }
        );

    } catch (err) {
        console.error(
            "ARSP Public School Confirmation Error:",
            err
        );

        req.flash("error", err.message);

        return res.redirect("/arsp/school/register");
    }
};
