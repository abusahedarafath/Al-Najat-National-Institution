const RtseApplication = require("../models/RtseApplication");
const fs = require("fs");
const path = require("path");

// =====================================
// Helpers
// =====================================

function deleteRtseFile(filename) {
    if (!filename) return;

    const filePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "rtse",
        filename
    );

    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error("Unable to delete RTSE file:", err.message);
        }
    }
}

// =====================================
// Application Form
// =====================================

exports.applicationPage = async (req, res) => {
    const draft = req.session.rtseDraft || {};

    res.render("rtse/application", {
        title: "Ratabari Talent Search Examination 2026 | RTSE Online Application",
        draft
    });
};

// =====================================
// Review Application
// =====================================

exports.submitApplication = async (req, res) => {
    try {
        const oldDraft = req.session.rtseDraft || {};

        const photoFile =
            req.files &&
            req.files.photo &&
            req.files.photo[0]
                ? req.files.photo[0].filename
                : oldDraft.photo || null;

        const identityFile =
            req.files &&
            req.files.identity_document &&
            req.files.identity_document[0]
                ? req.files.identity_document[0].filename
                : oldDraft.identity_document || null;

        // Photo is mandatory for a new application
        if (!photoFile) {
            return res.render("rtse/application", {
                title: "Ratabari Talent Search Examination 2026 | RTSE Online Application",
                error: "Candidate photograph is required.",
                draft: req.body
            });
        }

        // If a new photo was uploaded, remove the previous draft photo
        if (
            oldDraft.photo &&
            photoFile !== oldDraft.photo
        ) {
            deleteRtseFile(oldDraft.photo);
        }

        // If a new identity document was uploaded, remove previous one
        if (
            oldDraft.identity_document &&
            identityFile !== oldDraft.identity_document
        ) {
            deleteRtseFile(oldDraft.identity_document);
        }

        const section = RtseApplication.getSection(req.body.class);

        const draft = {
            full_name: req.body.full_name || "",
            father_name: req.body.father_name || "",
            mother_name: req.body.mother_name || "",
            gender: req.body.gender || "",
            dob: req.body.dob || "",
            mobile: req.body.mobile || "",
            email: req.body.email || "",
            school_name: req.body.school_name || "",
            district: req.body.district || "",
            state: req.body.state || "Assam",
            pincode: req.body.pincode || "",
            class: req.body.class || "",
            section,
            address: req.body.address || "",
            photo: photoFile,
            identity_document: identityFile
        };

        // IMPORTANT:
        // Nothing is inserted into the database here.
        req.session.rtseDraft = draft;

        return res.redirect("/rtse/review");

    } catch (err) {
        console.error("RTSE review error:", err);

        return res.render("rtse/application", {
            title: "Ratabari Talent Search Examination 2026 | RTSE Online Application",
            error: "Unable to prepare the application for review.",
            draft: req.body || {}
        });
    }
};

// =====================================
// Review Page
// =====================================

exports.reviewApplication = async (req, res) => {
    try {
        const draft = req.session.rtseDraft;

        if (!draft) {
            return res.redirect("/rtse/apply");
        }

        res.render("rtse/review", {
            title: "Review RTSE Application",
            draft
        });

    } catch (err) {
        console.error("RTSE review page error:", err);
        res.redirect("/rtse/apply");
    }
};

// =====================================
// Edit Application
// =====================================

exports.editApplication = async (req, res) => {
    return res.redirect("/rtse/apply");
};

// =====================================
// Confirm & Submit
// =====================================

exports.confirmApplication = async (req, res) => {
    try {
        const draft = req.session.rtseDraft;

        if (!draft) {
            return res.redirect("/rtse/apply");
        }

        // Create database record ONLY here.
        const result = await RtseApplication.create({
            full_name: draft.full_name,
            father_name: draft.father_name,
            mother_name: draft.mother_name,
            gender: draft.gender,
            dob: draft.dob,
            mobile: draft.mobile,
            email: draft.email,
            school_name: draft.school_name,
            district: draft.district,
            state: draft.state,
            pincode: draft.pincode,
            class: draft.class,
            address: draft.address,
            photo: draft.photo,
            identity_document: draft.identity_document
        });

        const application = {
            registration_no: result.registration_no,
            application_year: new Date().getFullYear(),
            section: result.section,
            full_name: draft.full_name,
            father_name: draft.father_name,
            mother_name: draft.mother_name,
            gender: draft.gender,
            dob: draft.dob,
            mobile: draft.mobile,
            email: draft.email,
            school_name: draft.school_name,
            district: draft.district,
            state: draft.state,
            pincode: draft.pincode,
            class: draft.class,
            address: draft.address,
            photo: draft.photo,
            identity_document: draft.identity_document
        };

        // Remove unconfirmed draft from session
        delete req.session.rtseDraft;

        return res.render("rtse/acknowledgement", {
            title: "RTSE Registration Successful",
            application
        });

    } catch (err) {
        console.error("RTSE confirmation error:", err);

        return res.render("rtse/review", {
            title: "Review RTSE Application",
            draft: req.session.rtseDraft || {},
            error: "Unable to submit the application. Please try again."
        });
    }
};
