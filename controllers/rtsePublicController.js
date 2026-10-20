const RtseApplication = require("../models/RtseApplication");
const RtseSetting = require("../models/RtseSetting");
const ArspSetting = require("../models/ArspSetting");
const RtseExamSetting = require("../models/RtseExamSetting");
const RtseExamSection = require("../models/RtseExamSection");
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
// RTSE Application Open Check
// =====================================
exports.requireApplicationOpen = async (req, res, next) => {
    try {
        const setting = await RtseSetting.get();

        if (!setting || Number(setting.application_open) !== 1) {
            return res.status(403).render("rtse/application-closed", {
                title: "RTSE Application Closed"
            });
        }

        next();
    } catch (err) {
        console.error("RTSE application status check error:", err);

        return res.status(500).send(
            "Unable to check RTSE application status."
        );
    }
};

// =====================================
// Application Form
// =====================================

exports.applicationPage = async (req, res) => {
    const draft = req.session.rtseDraft || {};
    const setting = await ArspSetting.get();
    const examSetting = await RtseExamSetting.getActive();
    const examYear = Number(examSetting?.exam_year) || null;

    res.render("rtse/application", {
    title: `Ratabari Talent Search Examination ${examYear || ""} | RTSE Online Application`,
    draft,
    setting,
    examYear
});

};

// =====================================
// Review Application
// =====================================

exports.submitApplication = async (req, res) => {
    try {
        const oldDraft = req.session.rtseDraft || {};
       const examSetting = await RtseExamSetting.getActive();
const examYear = Number(examSetting?.exam_year) || null;

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
                title: `Ratabari Talent Search Examination ${examYear || ""} | RTSE Online Application`,
                error: "Candidate photograph is required.",
                draft: req.body,
                setting: await ArspSetting.get(),
                examYear
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

        if (!examSetting || !Number.isInteger(Number(examSetting.id))) throw new Error("No active examination is configured.");
        const section = await RtseExamSection.getSectionForClass(examSetting.id, req.body.class);
        if (!section) throw new Error("This class is not mapped to a section for the active examination.");

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
            exam_setting_id: examSetting.id,
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

           const examSetting = await RtseExamSetting.getActive();
        const examYear = Number(examSetting?.exam_year) || null;

        return res.render("rtse/application", {
            title: `Ratabari Talent Search Examination ${examYear || ""} | RTSE Online Application`,
            error: "Unable to prepare the application for review.",
            draft: req.body || {},
            setting: await ArspSetting.get(),
            examYear
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

        // =========================================
        // FINAL APPLICATION-OPEN SECURITY CHECK
        // Prevent submission of an old draft after
        // the administrator closes applications.
        // =========================================
        const setting = await RtseSetting.get();

        if (!setting || Number(setting.application_open) !== 1) {
            return res.status(403).render(
                "rtse/application-closed",
                {
                    title: "RTSE Application Closed"
                }
            );
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
            school_id: draft.school_id || null,
            district: draft.district,
            state: draft.state,
            pincode: draft.pincode,
            class: draft.class,
            exam_setting_id: draft.exam_setting_id,
            section: draft.section,
            address: draft.address,
            photo: draft.photo,
            identity_document: draft.identity_document
        });

        const examSetting = await RtseExamSetting.getById(Number(draft.exam_setting_id));
        const application = {
            exam_setting_id: draft.exam_setting_id,
            exam_name: examSetting ? examSetting.exam_name : null,
            registration_no: result.registration_no,
            application_year: result.application_year,
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
