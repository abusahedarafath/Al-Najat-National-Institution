const ArspSetting = require("../models/ArspSetting");
const ArspSchool = require("../models/ArspSchool");
const RtseCentre = require("../models/RtseCentre");

// =====================================
// Public School Registration Page
// =====================================

exports.registerPage = async (req, res) => {
    try {
        const setting = await ArspSetting.get();
        const centres = await RtseCentre.getApproved();

        const old =
            req.session.arspSchoolRegistrationReview?.data || {};

        return res.render("arsp/school-register", {
            title: "School Registration | Active Rural Social Progress",
            setting,
            old,
            centres
        });

    } catch (err) {
        console.error("ARSP Public School Registration Page Error:", err);

        try {
            const setting = await ArspSetting.get();
            const centres = await RtseCentre.getApproved();

            return res.render("arsp/school-register", {
                title: "School Registration | Active Rural Social Progress",
                setting,
                old: {},
                centres,
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
            pincode: req.body.pincode || "",
            centre_id: Number(req.body.centre_id) || 0
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

        if (!Number.isInteger(data.centre_id) || data.centre_id <= 0) {
            req.flash(
                "error",
                "Please select an RTSE examination centre."
            );
            return res.redirect("/arsp/school/register");
        }

        const centre = await RtseCentre.getById(data.centre_id);

        if (!centre || centre.status !== "Approved") {
            req.flash(
                "error",
                "The selected RTSE examination centre is not available."
            );
            return res.redirect("/arsp/school/register");
        }

        req.session.arspSchoolRegistrationReview = {
            data
        };

        await new Promise((resolve, reject) => {
            req.session.save((sessionError) => {
                if (sessionError) {
                    return reject(sessionError);
                }

                resolve();
            });
        });

        return res.render("arsp/school-register-review", {
            title: "Review School Registration",
            setting,
            data,
            centre
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

        const centreId = Number(data.centre_id);

        if (!Number.isInteger(centreId) || centreId <= 0) {
            req.flash(
                "error",
                "No valid RTSE examination centre was selected."
            );
            return res.redirect("/arsp/school/register");
        }

        // Re-check the centre at final submission time.
        const centre = await RtseCentre.getById(centreId);

        if (!centre || centre.status !== "Approved") {
            req.flash(
                "error",
                "The selected RTSE examination centre is no longer available."
            );
            return res.redirect("/arsp/school/register");
        }

        // Create the school as Pending.
        // centre_id is deliberately NOT passed to ArspSchool.create()
        // because the centre relationship belongs to the assignment table.
        const schoolData = { ...data };
        delete schoolData.centre_id;

        const result = await ArspSchool.create({
            ...schoolData,
            status: "Pending",
            created_by: null
        });

        const school =
            await ArspSchool.getById(result.id);

        // Automatically send this school application to the
        // centre selected during public registration.
        await RtseCentre.assignSchool({
            school_id: school.id,
            centre_id: centre.id,
            application_year: new Date().getFullYear(),
            assigned_by: null,
            remarks: "School selected this centre during registration."
        });

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
