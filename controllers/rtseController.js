const RtseResult =
require("../models/RtseResult");
const ArspSetting = require("../models/ArspSetting");

const RtseSetting =
require("../models/RtseSetting");

const RtseCertificate =
require("../models/RtseCertificate");

const RtseExamSetting =
require("../models/RtseExamSetting");

const RtseApplication =
require("../models/RtseApplication");

const ArspSchool =
require("../models/ArspSchool");



// =====================================
// RTSE Application Helpers
// =====================================

const fs = require("fs");
const path = require("path");

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
            console.error(
                "Unable to delete RTSE file:",
                err.message
            );
        }

    }
};


// =====================================
// Application Form
// =====================================

exports.applicationPage = async (req, res) => {
    try {
        const draft = req.session.rtseDraft || {};
        const setting = await ArspSetting.get();

        let schools = [];

        try {
            schools = await ArspSchool.getAll();
        } catch (schoolErr) {
            console.error(
                "Unable to load RTSE schools:",
                schoolErr.message
            );
        }

        return res.render("rtse/application", {
            title: "Ratabari Talent Search Examination 2026 | RTSE Online Application",
            draft,
            setting,
            schools
        });
    } catch (err) {
        console.error("RTSE application page error:", err);

        return res.status(500).send(
            "Unable to load RTSE application page."
        );
    }
};

// =====================================
// Prepare Application for Review
// =====================================

exports.submitApplication = async (req, res) => {

    try {
        const setting = await RtseSetting.get();

        if (!setting || Number(setting.application_open) !== 1) {
            return res.status(403).render(
                "rtse/application-closed",
                {
                    title: "RTSE Application Closed"
                }
            );
        }



        const oldDraft =
            req.session.rtseDraft || {};

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


        if (!photoFile) {

            return res.render(
                "rtse/application",
                {
                    title: "RTSE Online Application",
                    error: "Candidate photograph is required.",
                    draft: req.body || {},
                    setting
                }
            );

        }


        // Remove old photo if a new one was uploaded

        if (
            oldDraft.photo &&
            photoFile !== oldDraft.photo
        ) {

            deleteRtseFile(
                oldDraft.photo
            );

        }


        // Remove old identity document
        // if a new one was uploaded

        if (
            oldDraft.identity_document &&
            identityFile !== oldDraft.identity_document
        ) {

            deleteRtseFile(
                oldDraft.identity_document
            );

        }


        const section =
            RtseApplication.getSection(
                req.body.class
            );

        const schoolId =
            String(req.body.school_id || "").trim();

        const otherSchoolName =
            String(req.body.other_school_name || "").trim();

        let schoolName = "";
        let selectedSchoolId = null;

        if (schoolId && schoolId !== "other") {

            const schools =
                await ArspSchool.getAll("", "Approved");

            const selectedSchool =
                schools.find(
                    school =>
                        String(school.id) === schoolId
                );

            if (!selectedSchool) {

                return res.status(400).render(
                    "rtse/application",
                    {
                        title: "RTSE Online Application",
                        error:
                            "Please select a valid registered school.",
                        draft: req.body || {},
                        schools,
                        setting
                    }
                );

            }

            // Always use canonical values from
            // the approved school database record.
            schoolName =
                selectedSchool.school_name;

            selectedSchoolId =
                Number(selectedSchool.id);

        } else if (
            schoolId === "other" &&
            otherSchoolName
        ) {

            schoolName =
                otherSchoolName;

            selectedSchoolId = null;

        } else {

            const schools =
                await ArspSchool.getAll("", "Approved");

            return res.status(400).render(
                "rtse/application",
                {
                    title: "RTSE Online Application",
                    error:
                        "Please select your school or choose Other.",
                    draft: req.body || {},
                    schools,
                    setting
                }
            );

        }


        // =========================================
        // RTSE PRODUCTION REVIEW DUPLICATE PROTECTION
        // =========================================
        //
        // This controller is the production controller used by
        // /rtse because server.js mounts routes/rtse.js.
        //
        // The check runs when "Review Application" is clicked,
        // BEFORE the application is redirected to /rtse/review.
        //
        // Nothing is inserted into the database at this stage.
        // =========================================

        const duplicate =
            await RtseApplication.findDuplicateByIdentity({
                full_name: req.body.full_name,
                father_name: req.body.father_name,
                mother_name: req.body.mother_name,
                dob: req.body.dob,
                school_name: schoolName
            });

        if (duplicate) {

            console.warn(
                "RTSE duplicate blocked at Review Application:",
                duplicate.registration_no
            );

            const approvedSchools =
                await ArspSchool.getAll("", "Approved");

            const setting =
                await ArspSetting.get();

            return res.status(409).render(
                "rtse/application",
                {
                    title:
                        "RTSE Application Already Registered",

                    error:
                        "This candidate is already registered.",

                    duplicatePopup: true,

                    duplicateCandidate: duplicate,

                    draft: req.body || {},

                    schools: approvedSchools,

                    setting
                }
            );
        }

        const draft = {

            full_name:
                req.body.full_name || "",

            father_name:
                req.body.father_name || "",

            mother_name:
                req.body.mother_name || "",

            gender:
                req.body.gender || "",

            dob:
                req.body.dob || "",

            mobile:
                req.body.mobile || "",

            email:
                req.body.email || "",

            school_name:
                schoolName,

            school_id:
                selectedSchoolId,

            district:
                req.body.district || "",

            state:
                req.body.state || "Assam",

            pincode:
                req.body.pincode || "",

            class:
                req.body.class || "",

            section,

            address:
                req.body.address || "",

            photo:
                photoFile,

            identity_document:
                identityFile

        };


        // IMPORTANT:
        // Nothing is inserted into the database here.

        req.session.rtseDraft = draft;


        return res.redirect(
            "/rtse/review"
        );

    }

    catch (err) {

        console.error(
            "RTSE review error:",
            err
        );

        return res.render(
            "rtse/application",
            {
                title: "RTSE Online Application",
                error:
                    "Unable to prepare the application for review.",
                draft: req.body || {}
            }
        );

    }

};


// =====================================
// Review Application
// =====================================

exports.reviewApplication = async (
    req,
    res
) => {

    try {

        const draft =
            req.session.rtseDraft;


        if (!draft) {

            return res.redirect(
                "/rtse/apply"
            );

        }


        res.render(
            "rtse/review",
            {
                title:
                    "Review RTSE Application",

                draft
            }
        );

    }

    catch (err) {

        console.error(
            "RTSE review page error:",
            err
        );

        res.redirect(
            "/rtse/apply"
        );

    }

};


// =====================================
// Edit Application
// =====================================

exports.editApplication = async (
    req,
    res
) => {

    return res.redirect(
        "/rtse/apply"
    );

};


// =====================================
// Confirm & Submit Application
// =====================================

exports.confirmApplication = async (
    req,
    res
) => {

    try {

        const draft =
            req.session.rtseDraft;


        if (!draft) {

            return res.redirect(
                "/rtse/apply"
            );

        }


        // =================================
        // Re-validate registered school
        // immediately before database insert.
        // Never trust the session value blindly.
        // =================================

        let confirmedSchoolId = null;
        let confirmedSchoolName =
            draft.school_name;

        if (draft.school_id) {

            const schools =
                await ArspSchool.getAll("", "Approved");

            const selectedSchool =
                schools.find(
                    school =>
                        Number(school.id) ===
                        Number(draft.school_id)
                );

            if (!selectedSchool) {

                return res.status(400).render(
                    "rtse/review",
                    {
                        title:
                            "Review RTSE Application",

                        draft,

                        error:
                            "The selected school is no longer available. Please return to the application and select your school again."
                    }
                );

            }

            confirmedSchoolId =
                Number(selectedSchool.id);

            confirmedSchoolName =
                selectedSchool.school_name;
        }

        // =================================
        // DATABASE INSERT HAPPENS HERE
        // ONLY AFTER CONFIRMATION
        // =================================

        const result =
            await RtseApplication.create({

                full_name:
                    draft.full_name,

                father_name:
                    draft.father_name,

                mother_name:
                    draft.mother_name,

                gender:
                    draft.gender,

                dob:
                    draft.dob,

                mobile:
                    draft.mobile,

                email:
                    draft.email,

                school_name:
                    confirmedSchoolName,

                school_id:
                    confirmedSchoolId,

                district:
                    draft.district,

                state:
                    draft.state,

                pincode:
                    draft.pincode,

                class:
                    draft.class,

                address:
                    draft.address,

                photo:
                    draft.photo,

                identity_document:
                    draft.identity_document

            });


        const application = {

            registration_no:
                result.registration_no,

            application_year:
                new Date().getFullYear(),

            section:
                result.section,

            full_name:
                draft.full_name,

            father_name:
                draft.father_name,

            mother_name:
                draft.mother_name,

            gender:
                draft.gender,

            dob:
                draft.dob,

            mobile:
                draft.mobile,

            email:
                draft.email,

            school_name:
                confirmedSchoolName,

            district:
                draft.district,

            state:
                draft.state,

            pincode:
                draft.pincode,

            class:
                draft.class,

            address:
                draft.address,

            photo:
                draft.photo,

            identity_document:
                draft.identity_document

        };


        // Remove draft after successful
        // database insertion

        delete req.session.rtseDraft;


        return res.render(
            "rtse/acknowledgement",
            {
                title:
                    "RTSE Registration Successful",

                application
            }
        );

    }

    catch (err) {

        console.error(
            "RTSE confirmation error:",
            err
        );


        return res.render(
            "rtse/review",
            {
                title:
                    "Review RTSE Application",

                draft:
                    req.session.rtseDraft || {},

                error:
                    "Unable to submit the application. Please try again."
            }
        );

    }

};


// =====================================

// =====================================
// Permanent Registration Slip Page
// =====================================

exports.registrationSlipPage = async (req, res) => {

    res.render(
        "rtse/registration-slip-search",
        {
            title: "RTSE Registration Slip",
            application: null,
            error: null
        }
    );

};


// =====================================
// Search Registration Slip
// =====================================

exports.registrationSlipSearch = async (req, res) => {

    try {

        const registrationNo =
            String(req.body.registration_no || "")
                .trim()
                .toUpperCase();

        const mobile =
            String(req.body.mobile || "")
                .trim();

        if (!registrationNo || !mobile) {

            return res.render(
                "rtse/registration-slip-search",
                {
                    title: "RTSE Registration Slip",
                    application: null,
                    error:
                        "Please enter your registration number and mobile number."
                }
            );

        }

        const application =
            await RtseApplication.getByRegistrationAndMobile(
                registrationNo,
                mobile
            );

        if (!application) {

            return res.render(
                "rtse/registration-slip-search",
                {
                    title: "RTSE Registration Slip",
                    application: null,
                    error:
                        "No RTSE application was found with the provided details."
                }
            );

        }

        return res.render(
            "rtse/acknowledgement",
            {
                title: "RTSE Registration Slip",

                application: {
                    registration_no:
                        application.registration_no,

                    application_year:
                        application.application_year,

                    section:
                        application.section,

                    full_name:
                        application.full_name,

                    father_name:
                        application.father_name,

                    mother_name:
                        application.mother_name,

                    gender:
                        application.gender,

                    dob:
                        application.dob,

                    mobile:
                        application.mobile,

                    email:
                        application.email,

                    school_name:
                        application.school_name,

                    district:
                        application.district,

                    state:
                        application.state,

                    pincode:
                        application.pincode,

                    class:
                        application.class,

                    address:
                        application.address,

                    photo:
                        application.photo,

                    identity_document:
                        application.identity_document,

                    status:
                        application.status
                }
            }
        );

    } catch (err) {

        console.error(
            "RTSE registration slip error:",
            err
        );

        return res.render(
            "rtse/registration-slip-search",
            {
                title: "RTSE Registration Slip",
                application: null,
                error:
                    "Unable to retrieve the registration slip."
            }
        );

    }

};


// =====================================
// Public Registration Verification
// =====================================

exports.verifyRegistration = async (req, res) => {

    try {

        const registrationNo =
            String(req.params.registrationNo || "")
                .trim()
                .toUpperCase();

        if (!registrationNo) {

            return res.status(400).render(
                "rtse/registration-verification",
                {
                    title:
                        "RTSE Registration Verification",

                    application: null,

                    error:
                        "Invalid registration number."
                }
            );

        }

        const application =
            await RtseApplication.getPublicVerification(
                registrationNo
            );

        if (!application) {

            return res.status(404).render(
                "rtse/registration-verification",
                {
                    title:
                        "RTSE Registration Verification",

                    application: null,

                    error:
                        "Registration number not found."
                }
            );

        }

        return res.render(
            "rtse/registration-verification",
            {
                title:
                    "RTSE Registration Verification",

                application,

                error: null
            }
        );

    } catch (err) {

        console.error(
            "RTSE verification error:",
            err
        );

        return res.status(500).render(
            "rtse/registration-verification",
            {
                title:
                    "RTSE Registration Verification",

                application: null,

                error:
                    "Unable to verify the registration."
            }
        );

    }

};



// Result Portal

// =====================================

exports.resultPortal = async (req,res)=>{

    const examSetting =
        await RtseExamSetting.get();

    res.render(

        "rtse/result-portal",

        {

            title:"RTSE Result",

            examSetting,

            student:null

        }

    );

};


// =====================================
// Search Result
// =====================================

exports.searchResult = async (req,res)=>{

    try{

        const keyword = req.body.keyword;

        const student =

        await RtseResult.searchResult(

            keyword

        );

        const examSetting =
            await RtseExamSetting.get();

        res.render(

            "rtse/result-portal",

            {

                title:"RTSE Result",

                examSetting,

                student

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Result not found."

        );

        res.redirect(

            "/rtse/result"

        );

    }

};


// =====================================
// View Result
// =====================================

exports.viewResult = async (req,res)=>{

    try{

        const student =

        await RtseResult.getByApplication(

            req.params.id

        );

        const examSetting =
            await RtseExamSetting.get();

        res.render(

            "rtse/result-view",

            {

                title:"RTSE Result",

                examSetting,

                student

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to load result."

        );

        res.redirect(

            "/rtse/result"

        );

    }

};




// =====================================
// Certificate Verification
// =====================================

exports.verifyCertificate = async (req,res)=>{

    try{

        const certificate=

        await RtseCertificate.getByCertificateNumber(

            req.params.number

        );

        const setting=

        await RtseExamSetting.get();

        res.render(

            "rtse/certificate-verification",

            {

                title:"Certificate Verification",

                setting,

                certificate

            }

        );

    }

    catch(err){

        console.error(err);

        res.render(

            "rtse/certificate-verification",

            {

                title:"Certificate Verification",

                setting:null,

                certificate:null

            }

        );

    }

};



// =====================================
// Certificate Portal
// =====================================

exports.certificatePortal = async (req,res)=>{

    res.render(

        "rtse/certificate-portal",

        {

            title:"Certificate Portal",

            certificate:null

        }

    );

};



// =====================================
// Search Certificate
// =====================================

exports.searchCertificate = async (req, res) => {

    try {

        const setting =
            await RtseSetting.get();

        if (!setting.certificate_publish) {

            req.flash(

                "error",

                "Certificates have not been published yet."

            );

            return res.redirect(

                "/rtse/certificate"

            );

        }

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        const certificate =
            await RtseCertificate.search(

                req.body.keyword,
                applicationYear

            );

        if (!certificate) {

            req.flash(

                "error",

                "Certificate not found."

            );

            return res.redirect(

                "/rtse/certificate"

            );

        }

        res.render(

            "rtse/certificate-portal",

            {

                title: "Certificate Portal",

                certificate

            }

        );

    }

    catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to search certificate."

        );

        res.redirect(

            "/rtse/certificate"

        );

    }

};
