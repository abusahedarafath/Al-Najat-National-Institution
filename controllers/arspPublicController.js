const ArspSetting = require("../models/ArspSetting");
const ArspRegistrationService = require("../services/arspRegistrationService");


// =====================================
// Membership Registration Page
// =====================================

exports.registerPage = async (req, res) => {
    try {
        const setting = await ArspSetting.get();

        const old = req.session.arspRegistrationReview?.data || {};

        return res.render(
            "arsp/register",
            {
                title: "Active Rural Social Progress",
                setting,
                old
            }
        );

    } catch (err) {

        console.error(err);

        const setting = await ArspSetting.get();

        return res.render(
            "arsp/register",
            {
                title: "Become an ARSP Member",
                setting,
                error: err.message,
                old: {}
            }
        );
    }
};


// =====================================
// Review Membership Registration
// =====================================

exports.review = async (req, res) => {

    try {

        const setting = await ArspSetting.get();

        // -------------------------------------
        // Uploaded files
        // -------------------------------------

        const previousFiles =
            req.session.arspRegistrationReview?.files || {};

        const files = {
            photo:
                req.files?.photo?.[0]?.filename ||
                previousFiles.photo ||
                "",

            identity_front:
                req.files?.identity_front?.[0]?.filename ||
                previousFiles.identity_front ||
                "",

            identity_back:
                req.files?.identity_back?.[0]?.filename ||
                previousFiles.identity_back ||
                ""
        };


        // -------------------------------------
        // Store only necessary information
        // -------------------------------------
        // IMPORTANT:
        // File contents are NOT stored in session.
        // Only filenames are stored.
        // -------------------------------------

        req.session.arspRegistrationReview = {

            data: {
                full_name: req.body.full_name || "",
                father_name: req.body.father_name || "",
                mother_name: req.body.mother_name || "",
                gender: req.body.gender || "",
                dob: req.body.dob || "",
                blood_group: req.body.blood_group || "",
                occupation: req.body.occupation || "",
                nationality: req.body.nationality || "Indian",
                joining_date: req.body.joining_date || "",

                mobile: req.body.mobile || "",
                email: req.body.email || "",
                address: req.body.address || "",
                district: req.body.district || "",
                state: req.body.state || "",
                pincode: req.body.pincode || "",

                identity_type: req.body.identity_type || "",
                identity_number: req.body.identity_number || ""
            },

            files
        };


        // -------------------------------------
        // Save session before rendering
        // -------------------------------------

        req.session.save((sessionError) => {

            if (sessionError) {

                console.error(
                    "ARSP Review Session Error:",
                    sessionError
                );

                req.flash(
                    "error",
                    "Unable to prepare your application for review."
                );

                return res.redirect("/arsp/register");
            }


            return res.render(
                "arsp/membership-review",
                {
                    title: "Review ARSP Membership Registration",
                    setting,
                    data:
                        req.session.arspRegistrationReview.data,
                    files:
                        req.session.arspRegistrationReview.files
                }
            );

        });

    } catch (err) {

        console.error(
            "ARSP Membership Review Error:",
            err
        );

        req.flash(
            "error",
            err.message
        );

        return res.redirect("/arsp/register");
    }
};


// =====================================
// Confirm & Submit Membership
// =====================================

exports.confirm = async (req, res) => {

    try {

        const review =
            req.session.arspRegistrationReview;

        const setting =
            await ArspSetting.get();


        // -------------------------------------
        // Prevent direct confirmation
        // -------------------------------------

        if (!review || !review.data) {

            req.flash(
                "error",
                "Your review session has expired. Please complete the registration form again."
            );

            return res.redirect("/arsp/register");
        }


        // -------------------------------------
        // Reconstruct Multer-style files
        // -------------------------------------
        // The existing registration service
        // expects req.files.*[0].filename.
        // -------------------------------------

        req.files = {

            photo: review.files?.photo
                ? [{ filename: review.files.photo }]
                : [],

            identity_front: review.files?.identity_front
                ? [{ filename: review.files.identity_front }]
                : [],

            identity_back: review.files?.identity_back
                ? [{ filename: review.files.identity_back }]
                : []
        };


        // -------------------------------------
        // FINAL DATABASE REGISTRATION
        // -------------------------------------

        const result =
            await ArspRegistrationService.register(
                {
                    ...review.data,

                    registration_source: "Self",

                    approval_status: "Pending"
                },
                req
            );


        // -------------------------------------
        // Clear review session
        // -------------------------------------

        delete req.session.arspRegistrationReview;


        // -------------------------------------
        // Existing registration slip flow
        // -------------------------------------

        req.session.lastArspRegistration = {

            memberId:
                result.member.member_id,

            memberDbId:
                result.member.id,

            loginUrl:
                result.loginUrl,

            registrationSource:
                "Self"
        };


        return res.render(
            "arsp-documents/membership-registration-slip",
            {
                title:
                    "Membership Registration Slip",

                setting,

                member:
                    result.member,

                username:
                    result.memberId,

                loginUrl:
                    result.loginUrl,

                registrationSource:
                    "Self Registration"
            }
        );

    } catch (err) {

        console.error(
            "ARSP Membership Confirmation Error:",
            err
        );

        req.flash(
            "error",
            err.message
        );

        return res.redirect(
            "/arsp/register"
        );
    }
};
