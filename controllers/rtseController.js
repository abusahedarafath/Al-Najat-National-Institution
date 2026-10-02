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
            schools = await ArspSchool.getAll("", "Approved");
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

        const setting = await ArspSetting.get();

        return res.render(
            "rtse/application",
            {
                title: "RTSE Online Application",
                error:
                    "Unable to prepare the application for review.",
                draft: req.body || {},
                setting
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



// =====================================
// Public RTSE Result Portal
// =====================================

function publicResultNoStore(res) {
    res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
}

function publicResultPublished(setting) {
    return Number(setting && setting.result_publish) === 1;
}

function normalizePublicMobile(value) {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizePublicDob(value) {
    const raw = String(value || "").trim();

    if (!raw) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }

    let match = raw.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);

    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return "";
}

function formatPublicDate(value) {
    if (!value) return "";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return String(value).slice(0, 10);
    }

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
}

function calculatePublicComponentGrade(marks, maximumMarks) {
    const obtained = Number(marks);
    const maximum = Number(maximumMarks);

    if (!Number.isFinite(obtained) || !Number.isFinite(maximum) || maximum <= 0) {
        return "";
    }

    const percentage = (obtained / maximum) * 100;

    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    return "F";
}

function buildPublicResultPayload(student) {
    const components = Array.isArray(student.component_marks)
        ? student.component_marks.map(component => {
            const marks = Number(component.marks);
            const maximumMarks = Number(component.maximum_marks);

            if (Number(component.grade_counting) !== 1) {
                return null;
            }

            return {
                component_id: component.component_id,
                name: component.name,
                grade: calculatePublicComponentGrade(
                    marks,
                    maximumMarks
                )
            };
        })
        : [];

    const gradeComponents = components.filter(Boolean);

    return {
        application_id: student.application_id,
        registration_no: student.registration_no,
        roll_no: student.roll_no,
        full_name: student.full_name,
        class: student.class,
        section: student.section,
        photo: student.photo || null,

        omr_marks:
            student.marks ?? null,

        section_rank: student.section_rank,
        overall_rank: student.overall_rank,

        component_grades: gradeComponents.map(component => ({
            component_id: component.component_id,
            name: component.name,
            grade: component.grade
        }))
    };
}

// =====================================
// Result Portal
// =====================================

exports.resultPortal = async (req, res) => {
    try {
        const [examSetting, rtseSetting] = await Promise.all([
            RtseExamSetting.get(),
            RtseSetting.get()
        ]);

        publicResultNoStore(res);

        return res.render(
            "rtse/result-portal",
            {
                title: "RTSE Result",
                examSetting,
                resultsPublished: publicResultPublished(rtseSetting)
            }
        );
    } catch (err) {
        console.error("RTSE public result portal error:", err);
        return res.status(500).send("Unable to load RTSE Result Portal.");
    }
};

// =====================================
// Public Result Candidate Search
// =====================================


exports.resultPublicationStatus = async (req, res) => {
    try {
        publicResultNoStore(res);


        /*
         * Finalize an expired scheduled publication before reading
         * the current publication state. This uses the same
         * server-side publication mechanism as the scheduler.
         */
        await RtseSetting.publishScheduledResults();

        /*
         * Read result_publish_at as a raw MariaDB DATETIME string.
         *
         * The admin controller stores this value in UTC after
         * converting the selected IST publication time. Reading it
         * through mysql2 as a JavaScript Date can apply the process
         * timezone (IST), causing an unwanted 5:30 hour shift.
         *
         * This query is intentionally local to the public publication
         * status endpoint. RtseSetting.get() is used elsewhere and
         * must not be changed globally.
         */
        const db = require("../config/database");

        const [settingRows] = await db.query(`
            SELECT
                *,
                DATE_FORMAT(
                    result_publish_at,
                    '%Y-%m-%d %H:%i:%s'
                ) AS result_publish_at_utc_raw
            FROM rtse_settings
            LIMIT 1
        `);

        const rtseSetting = settingRows[0] || null;

        const published =
            publicResultPublished(rtseSetting);

        const scheduled =
            Number(rtseSetting?.result_publish_scheduled) === 1 &&
            rtseSetting?.result_publish_at_utc_raw;

        let publishAtUtcMs = null;
        let countdownSeconds = 0;
        let countdownStartAtUtcMs = null;

        if (scheduled) {
            const raw =
                String(
                    rtseSetting.result_publish_at_utc_raw || ""
                ).trim();

            const match = raw.match(
                /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/
            );

            if (match) {
                const year = Number(match[1]);
                const month = Number(match[2]);
                const day = Number(match[3]);
                const hour = Number(match[4]);
                const minute = Number(match[5]);
                const second = Number(match[6]);

                publishAtUtcMs = Date.UTC(
                    year,
                    month - 1,
                    day,
                    hour,
                    minute,
                    second
                );

                countdownSeconds = Number(
                    rtseSetting.result_publish_countdown_seconds || 0
                );

                if (
                    !Number.isSafeInteger(countdownSeconds) ||
                    countdownSeconds < 0
                ) {
                    countdownSeconds = 0;
                }

                countdownStartAtUtcMs =
                    publishAtUtcMs -
                    countdownSeconds * 1000;
            }
        }

        /*
         * The server's current UTC timestamp is obtained from the
         * database, so the visitor's device clock cannot control
         * the countdown.
         */

        const [rows] = await db.query(
            `SELECT UNIX_TIMESTAMP() * 1000 AS server_now_utc_ms`
        );

        const serverNowUtcMs =
            Number(rows[0]?.server_now_utc_ms || Date.now());

        return res.json({
            success: true,
            published,
            scheduled: Boolean(
                scheduled && publishAtUtcMs !== null
            ),
            server_now_utc_ms: serverNowUtcMs,
            publish_at_utc_ms: publishAtUtcMs,
            countdown_start_at_utc_ms:
                countdownStartAtUtcMs,
            countdown_seconds: countdownSeconds
        });
    } catch (err) {
        console.error(
            "RTSE result publication status error:",
            err
        );

        publicResultNoStore(res);

        return res.status(500).json({
            success: false,
            message:
                "Unable to load result publication status."
        });
    }
};

exports.searchResult = async (req, res) => {
    try {
        publicResultNoStore(res);

        const rtseSetting = await RtseSetting.get();

        if (!publicResultPublished(rtseSetting)) {
            return res.status(403).json({
                success: false,
                message: "Results are not published yet."
            });
        }

        const keyword = String(req.body.keyword || "")
            .trim()
            .replace(/\s+/g, " ");

        if (keyword.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Enter at least 2 characters."
            });
        }

        const candidates =
            await RtseResult.searchPublicCandidates(keyword);

        return res.json({
            success: true,
            candidates: candidates.map(candidate => ({
                application_id: candidate.application_id,
                registration_no: candidate.registration_no,
                roll_no: candidate.roll_no,
                full_name: candidate.full_name,
                father_name: candidate.father_name,
                class: candidate.class,
                section: candidate.section
            }))
        });
    } catch (err) {
        console.error("RTSE public result search error:", err);

        publicResultNoStore(res);

        return res.status(500).json({
            success: false,
            message: "Unable to search results."
        });
    }
};

// =====================================
// Public Result Verification
// =====================================

exports.verifyPublicResult = async (req, res) => {
    try {
        publicResultNoStore(res);

        const rtseSetting = await RtseSetting.get();

        if (!publicResultPublished(rtseSetting)) {
            return res.status(403).json({
                success: false,
                message: "Results are not published yet."
            });
        }

        const applicationId = Number(req.body.application_id);
        const rollNo = String(req.body.roll_no || "").trim();
        const credentialType = String(
            req.body.credential_type || ""
        ).trim().toLowerCase();

        const credentialValue = String(
            req.body.credential_value || ""
        ).trim();

        if (
            !Number.isInteger(applicationId) ||
            applicationId <= 0 ||
            !rollNo ||
            !credentialValue ||
            !["dob", "mobile"].includes(credentialType)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid verification details."
            });
        }

        const application =
            await RtseResult.getPublicVerificationApplication(
                applicationId,
                rollNo
            );

        if (!application) {
            return res.status(401).json({
                success: false,
                message: "Verification failed. Please check your details."
            });
        }

        let verified = false;

        if (credentialType === "dob") {
            const enteredDob = normalizePublicDob(credentialValue);
            const storedDob = formatPublicDate(application.dob);

            verified =
                Boolean(enteredDob) &&
                Boolean(storedDob) &&
                enteredDob === storedDob;
        }

        if (credentialType === "mobile") {
            const enteredMobile =
                normalizePublicMobile(credentialValue);

            const storedMobile =
                normalizePublicMobile(application.mobile);

            verified =
                Boolean(enteredMobile) &&
                enteredMobile.length === 10 &&
                enteredMobile === storedMobile;
        }

        if (!verified) {
            return res.status(401).json({
                success: false,
                message: "Verification failed. Please check your details."
            });
        }

        const student =
            await RtseResult.getStudentPopupResult(applicationId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Result data was not found."
            });
        }

        if (!req.session) {
            return res.status(500).json({
                success: false,
                message: "Session is unavailable."
            });
        }

        req.session.rtsePublicResultVerification = {
            applicationId,
            verifiedAt: Date.now()
        };

        return res.json({
            success: true,
            result: buildPublicResultPayload(student)
        });
    } catch (err) {
        console.error("RTSE public result verification error:", err);

        publicResultNoStore(res);

        return res.status(500).json({
            success: false,
            message: "Unable to verify result."
        });
    }
};

// =====================================
// View Official Mark Sheet
// =====================================

exports.viewResult = async (req, res) => {
    try {
        publicResultNoStore(res);

        const rtseSetting = await RtseSetting.get();

        if (!publicResultPublished(rtseSetting)) {
            return res.status(403).send(
                "RTSE results are not currently published."
            );
        }

        const applicationId = Number(req.params.id);

        if (!Number.isInteger(applicationId) || applicationId <= 0) {
            return res.status(404).send("Result not found.");
        }

        const verification =
            req.session &&
            req.session.rtsePublicResultVerification;

        const verificationValid =
            verification &&
            Number(verification.applicationId) === applicationId &&
            Number.isFinite(Number(verification.verifiedAt)) &&
            Date.now() - Number(verification.verifiedAt) <=
                10 * 60 * 1000;

        if (!verificationValid) {
            return res.status(403).send(
                "Please verify the result before viewing the mark sheet."
            );
        }

        const student =
            await RtseResult.getByApplication(applicationId);

        if (!student) {
            return res.status(404).send("Result not found.");
        }

        return res.render(
            "rtse/result-view",
            {
                title: "RTSE Result",
                examSetting: await RtseExamSetting.get(),
                student
            }
        );
    } catch (err) {
        console.error("RTSE public mark sheet error:", err);

        return res.status(500).send(
            "Unable to load the result mark sheet."
        );
    }
};

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
