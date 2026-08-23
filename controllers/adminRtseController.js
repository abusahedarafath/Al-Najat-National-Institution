const RtseApplication =
require("../models/RtseApplication");

const ArspSchool = require("../models/ArspSchool");
const RtseSetting =
require("../models/RtseSetting");

const SiteSetting =
require("../models/SiteSetting");

const RtseSeatPlan =
require("../models/RtseSeatPlan");

const RtseResult =
require("../models/RtseResult");

const RtseCertificate =
require("../models/RtseCertificate");

const generateCertificateQR =
require("../utils/certificateQrGenerator");

const RtseCertificateService =
require("../services/rtseCertificateService");

const ExcelJS = require("exceljs");
const RtseExcel = require("../utils/rtseExcel");
const QRCode = require("qrcode");
const RtseExamAttendance = require("../models/RtseExamAttendance");

const RtseExamSetting = require("../models/RtseExamSetting");
// =====================================
// RTSE Dashboard
// =====================================

// =====================================
// RTSE Dashboard
// =====================================

exports.dashboard = async (req, res) => {

    try {

        const stats =
            await RtseApplication.getDashboardStats();

  const sectionStats = await RtseApplication.getSectionStatistics();

  const setting = await RtseSetting.get();

const admitGenerated =
    sectionStats.some(
        s => (s.admit_generated || 0) > 0
    );


console.log("sectionStats:", sectionStats);
console.log("admitGenerated:", admitGenerated);
console.log("setting:", setting);


        res.render(

            "admin/rtse/dashboard",

            {

                title: "RTSE Dashboard",

                total: stats.total || 0,

                pending: stats.pending || 0,

                approved: stats.approved || 0,

                rejected: stats.rejected || 0,

                admitGenerated,

                sectionStats,

                setting

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load RTSE Dashboard."

        );

        res.redirect("/admin");

    }

};

// =====================================
// RTSE Student Applications
// =====================================

exports.applicationsPage = async (req, res) => {

    try {

        const page =
            Math.max(1, parseInt(req.query.page, 10) || 1);

        const allowedPerPage = [10, 25, 50, 100];

        const requestedPerPage =
            parseInt(req.query.perPage, 10) || 10;

        const perPage =
            allowedPerPage.includes(requestedPerPage)
                ? requestedPerPage
                : 10;

        const search =
            String(req.query.search || "").trim();

        const status =
            String(req.query.status || "").trim();

        const allowedStatuses = [
            "Pending",
            "Approved",
            "Rejected"
        ];

        const activeStatus =
            allowedStatuses.includes(status)
                ? status
                : "";

        const offset =
            (page - 1) * perPage;

        const applications =
            await RtseApplication.getDashboardApplications(
                perPage,
                offset,
                search,
                activeStatus
            );

        const applicationCount =
            await RtseApplication.getDashboardApplicationCount(
                search,
                activeStatus
            );

        const setting =
            await RtseSetting.get();

        const siteSettings =
            await SiteSetting.get();

        const totalPages =
            Math.max(
                1,
                Math.ceil(applicationCount / perPage)
            );

        res.render(
            "admin/rtse/applications",
            {
                title: activeStatus
                    ? `RTSE ${activeStatus} Applications`
                    : "RTSE Student Applications",

                applications,
                page,
                perPage,
                search,
                status: activeStatus,
                applicationCount,
                totalPages,
                arspSettings: setting,
                siteSettings,
                currentPath: req.path
            }
        );

    } catch (err) {

        console.error(
            "RTSE Applications Load Error:",
            err
        );

        req.flash(
            "error",
            "Unable to load RTSE Student Applications."
        );

        res.redirect("/admin/rtse");
    }
};


// =====================================
// Application Details
// =====================================

exports.applicationDetails =
async (req,res)=>{

    try{

        const application =
            await RtseApplication.getById(
                req.params.id
            );

        if(!application){

            req.flash(
                "error",
                "Application not found."
            );

            return res.redirect(
                "/admin/rtse"
            );

        }

        res.render(

            "admin/rtse/application-profile",

            {

                title:
                    "RTSE Application",

                application,

                returnPage:
                    req.query.returnPage || 1,

                returnPerPage:
                    req.query.returnPerPage || 10,

                returnSearch:
                    req.query.returnSearch || "",

                returnStatus:
                    req.query.returnStatus || ""

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to load application."

        );

        res.redirect("/admin/rtse");

    }

};


// =====================================
// Approve Application
// =====================================

exports.approveApplication =
async(req,res)=>{

    try{

        await RtseApplication.updateStatus(

            req.params.id,

            "Approved"

        );

        req.flash(

            "success",

            "Application Approved Successfully."

        );

        res.redirect("/admin/rtse");

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to approve application."

        );

        res.redirect("/admin/rtse");

    }

};


// =====================================
// Reject Application
// =====================================

exports.rejectApplication =
async(req,res)=>{

    try{

        await RtseApplication.updateStatus(

            req.params.id,

            "Rejected"

        );

        req.flash(

            "success",

            "Application Rejected."

        );

        res.redirect("/admin/rtse");

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to reject application."

        );

        res.redirect("/admin/rtse");

    }

};




// =====================================

// =====================================
// RTSE Live Application Search
// =====================================

exports.liveApplicationSearch = async (req, res) => {
    try {

        const search =
            String(req.query.search || "").trim();

        const status =
            String(req.query.status || "").trim();

        const allowedStatuses = [
            "Pending",
            "Approved",
            "Rejected"
        ];

        const activeStatus =
            allowedStatuses.includes(status)
                ? status
                : "";

        const perPage = Math.min(
            100,
            Math.max(
                1,
                parseInt(req.query.perPage, 10) || 10
            )
        );

        const applications =
            await RtseApplication.getDashboardApplications(
                perPage,
                0,
                search,
                activeStatus
            );

        const applicationCount =
            await RtseApplication.getDashboardApplicationCount(
                search,
                activeStatus
            );

        return res.json({
            success: true,
            applications,
            applicationCount,
            status: activeStatus
        });

    } catch (err) {

        console.error(
            "RTSE Live Application Search Error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Unable to search RTSE applications."
        });
    }
};

// Edit Application Page
// =====================================

exports.editApplicationPage = async (req, res) => {

    try {

        const application =
            await RtseApplication.getById(
                req.params.id
            );

        if (!application) {

            req.flash(
                "error",
                "Application not found."
            );

            return res.redirect("/admin/rtse");

        }

        const schools = await ArspSchool.getAll("", "Approved");

res.render(

            "admin/rtse/edit-application",

            {

                title: "Edit Application",

                application,
                schools

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load application."
        );

        res.redirect("/admin/rtse");

    }

};


// =====================================
// Update Application
// =====================================

exports.updateApplication = async (req, res) => {

    try {

        await RtseApplication.update(

            req.params.id,

            req.body,

            req.files

        );

        req.flash(

            "success",

            "Application updated successfully."

        );

        res.redirect(

            "/admin/rtse/application/" +
            req.params.id

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to update application."

        );

        res.redirect(

            "/admin/rtse/application/" +
            req.params.id +
            "/edit"

        );

    }

};


// =====================================
// Archive Application
// =====================================

exports.archiveApplication = async (req, res) => {

    try {

        await RtseApplication.archive(
            req.params.id
        );

        req.flash(

            "success",

            "Application moved to Archive."

        );

        res.redirect("/admin/rtse");

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to archive application."

        );

        res.redirect("/admin/rtse");

    }

};


// =====================================
// Archive List
// =====================================

exports.archive = async (req, res) => {

    try {

        const applications =
            await RtseApplication.getArchived();

        res.render(

            "admin/rtse/archive",

            {

                title: "RTSE Archive",

                applications

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load archive."

        );

        res.redirect("/admin/rtse");

    }

};


// =====================================
// Restore Application
// =====================================

exports.restoreApplication = async (req, res) => {

    try {

        await RtseApplication.restore(
            req.params.id
        );

        req.flash(

            "success",

            "Application restored successfully."

        );

        res.redirect("/admin/rtse/archive");

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to restore application."

        );

        res.redirect("/admin/rtse/archive");

    }

};



// =====================================
// Permanently Delete RTSE Application
// =====================================

exports.permanentlyDeleteApplication = async (req, res) => {

    try {

        const deleted = await RtseApplication.permanentDelete(
            req.params.id
        );

        if (!deleted) {

            return res.status(404).send(
                "RTSE Application not found"
            );

        }

        res.redirect("/admin/rtse/archive");

    } catch (error) {

        console.error(
            "RTSE permanent delete error:",
            error
        );

        res.status(500).send(
            "Database Error"
        );

    }

};



// =====================================
// Reset Roll Numbers + Admit Cards
// Section Wise
// =====================================

exports.resetRollNumbers = async (req, res) => {

    const section =
        String(req.params.section || "")
            .trim()
            .toUpperCase();

    try{

        if(!["A","B","C","D","E"].includes(section)){

            req.flash(
                "error",
                "Invalid RTSE section."
            );

            return res.redirect("/admin/rtse");
        }

        const setting =
            await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        const result =
            await RtseApplication.resetRollNumbers(
                section,
                applicationYear
            );

        req.flash(
            "success",
            `Section ${section} (${applicationYear}) has been reset successfully. Roll numbers and generated admit-card status were reset. Existing attendance records were not modified.`
        );

        console.log(
            "RTSE_RESET_ROLL_SUCCESS:",
            JSON.stringify(result)
        );

        return res.redirect("/admin/rtse");

    } catch(error){

        console.error(
            "RTSE reset roll number error:",
            error
        );

        if(
            error.code ===
            "RTSE_ATTENDANCE_ALREADY_RECORDED"
        ){

            req.flash(
                "error",
                "Cannot reset Roll No. because attendance records already exist for one or more students in this section. Existing examination identity must remain unchanged."
            );

        } else {

            req.flash(
                "error",
                "Unable to reset Roll No. for this section."
            );

        }

        return res.redirect("/admin/rtse");
    }
};



// =====================================
// Generate Roll Numbers
// =====================================

// =====================================
// Generate Roll Numbers
// =====================================

exports.generateRollNumbers = async (req, res) => {

    try {

        const section =
            String(req.params.section || "")
                .trim()
                .toUpperCase();

        const setting = await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        const totalGenerated =
            await RtseApplication.generateRollNumbers(
                section,
                applicationYear
            );

        req.flash(
            "success",
            `${totalGenerated} Roll Numbers generated successfully for Section ${section} (${applicationYear}).`
        );

        return res.redirect("/admin/rtse");

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Failed to generate Roll Numbers."
        );

        return res.redirect("/admin/rtse");
    }
};
// =====================================
// Generate Admit Cards
// =====================================

exports.generateAdmitCards = async (req, res) => {

    console.log(
        ">>> Generate Admit Cards POST received for section:",
        req.params.section
    );

    try {

        const section =
            String(req.params.section || "")
                .trim()
                .toUpperCase();

        const setting = await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        await RtseApplication.generateAdmitCards(
            section,
            applicationYear
        );

        const qrCreated =
            await RtseExamAttendance.ensureForSection(
                section,
                applicationYear
            );

        console.log(
            "RTSE QR attendance records created:",
            qrCreated
        );

        req.flash(
            "success",
            `Admit Cards generated successfully for Section ${section} (${applicationYear}).`
        );

        return res.redirect("/admin/rtse");

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to generate Admit Cards."
        );

        return res.redirect("/admin/rtse");
    }
};
// =====================================
// Approved Students - Section Wise
// =====================================

exports.approvedStudents = async (req, res) => {

    try {

        const section =
            String(req.params.section).toUpperCase();

        if(!["A","B","C","D","E"].includes(section)){

            req.flash(
                "error",
                "Invalid RTSE section."
            );

            return res.redirect("/admin/rtse");

        }

        const setting =
            await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        const students =
            await RtseApplication.getApprovedSectionStudents(
                section,
                applicationYear
            );

        res.render(
            "admin/rtse/approved-students",
            {
                title:
                    `Approved Students - Section ${section}`,

                section,

                applicationYear,

                students
            }
        );

    } catch(err) {

        console.error(
            "Approved Students Error:",
            err
        );

        req.flash(
            "error",
            "Unable to load approved students."
        );

        res.redirect("/admin/rtse");

    }

};



// =====================================
// Live Search Approved Students - Section Wise
// =====================================

exports.liveApprovedSectionSearch = async (req, res) => {

    try {

        const section =
            String(req.params.section || "").toUpperCase();

        if (!["A", "B", "C", "D", "E"].includes(section)) {

            return res.status(400).json({
                success: false,
                message: "Invalid RTSE section."
            });

        }

        const setting =
            await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            return res.status(500).json({
                success: false,
                message:
                    "Active RTSE exam year is not configured."
            });
        }

        const search =
            String(req.query.search || "").trim();

        const students =
            await RtseApplication.searchApprovedSectionStudents(
                section,
                applicationYear,
                search
            );

        return res.json({
            success: true,
            students
        });

    } catch (err) {

        console.error(
            "RTSE approved section live search error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Unable to search approved students."
        });

    }

};


// =====================================
// Make Approved Student Pending
// =====================================

exports.makeApprovedStudentPending =
async (req, res) => {

    try {

        await RtseApplication.makePending(
            req.params.id
        );

        req.flash(
            "success",
            "Student moved back to Pending."
        );

        return res.redirect(
            `/admin/rtse/approved/${req.params.section}`
        );

    } catch(err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to make student Pending."
        );

        return res.redirect(
            `/admin/rtse/approved/${req.params.section}`
        );

    }

};


// =====================================
// Remove Approved Student
// =====================================

exports.removeApprovedStudent =
async (req, res) => {

    try {

        await RtseApplication.archive(
            req.params.id
        );

        req.flash(
            "success",
            "Approved student removed and moved to Archive."
        );

        return res.redirect(
            `/admin/rtse/approved/${req.params.section}`
        );

    } catch(err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to remove approved student."
        );

        return res.redirect(
            `/admin/rtse/approved/${req.params.section}`
        );

    }

};


// =====================================
// Export All Applications
// =====================================

exports.exportExcel = async (req, res) => {
    try {
        await RtseExcel.exportAll(req, res);
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to export Excel.");
        res.redirect("/admin/rtse");
    }
};

// =====================================
// Export Approved Applications
// =====================================
exports.exportApprovedExcel = async (req, res) => {
    try {
        await RtseExcel.exportApproved(req, res);
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to export approved students Excel.");
        res.redirect("/admin/rtse");
    }
};

// =====================================
// Export Section Wise
// =====================================

// =====================================

exports.exportSectionExcel = async (req, res) => {

    try {

        await RtseExcel.exportSection(

            req,

            res,

            req.params.section

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to export Section Excel."

        );

        res.redirect("/admin/rtse");

    }

};



// =====================================
// Admit Card Generation Page
// =====================================

exports.admitGenerationPage = async (req, res) => {

    try {

        const section =
            String(req.params.section || "")
                .trim()
                .toUpperCase();

        const setting = await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        const students =
            await RtseApplication.getAdmitCardStudents(
                section,
                applicationYear
            );

        if(!students.length){

            req.flash(
                "error",
                `No students found for admit card generation in Section ${section} for ${applicationYear}.`
            );

            return res.redirect("/admin/rtse");
        }

        res.render(
            "admin/rtse/admit-generation",
            {
                title: "Generate Admit Cards",
                section,
                applicationYear,
                students
            }
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load admit card generator."
        );

        res.redirect("/admin/rtse");
    }
};
// =====================================
// //View Admit Card
// =====================================

exports.viewAdmitCard = async (req, res) => {

    try {

        const student =
            await RtseApplication.getById(
                req.params.id
            );

        if (!student) {

            req.flash(
                "error",
                "Student not found."
            );

            return res.redirect("/admin/rtse");

        }

        const ArspSetting =
            require("../models/ArspSetting");

        const setting =
            await ArspSetting.get();

        const examSetting =
            await RtseExamSetting.get();

        // Guarantee an attendance QR record for a generated admit.
        let attendance = null;

        if (
            Number(student.admit_generated) === 1 &&
            student.status === "Approved" &&
            student.roll_no
        ) {
            attendance =
                await RtseExamAttendance.ensureForApplication(
                    student.id
                );
        }

        let qrData = null;

        if (attendance && attendance.qr_token) {
            qrData = await QRCode.toDataURL(
                attendance.qr_token,
                {
                    width: 180,
                    margin: 2,
                    errorCorrectionLevel: "M"
                }
            );
        }

        res.render(

            "rtse/student-admit-card",

            {

                title: "RTSE Admit Card",

                setting,

                student,

                attendance,

                qrData,

                                examSetting,
                examYear:
                    examSetting?.exam_year ||
                    setting?.exam_year ||
                    new Date().getFullYear()

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load Admit Card."
        );

        res.redirect("/admin/rtse");

    }

};





// =====================================
// Close Applications
// =====================================

exports.closeApplications = async (req, res) => {

    try {

        await RtseSetting.closeApplications();

        req.flash(

            "success",

            "RTSE applications closed successfully."

        );

        res.redirect("/admin/rtse");

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to close applications."

        );

        res.redirect("/admin/rtse");

    }

};


// =====================================
// Open Applications
// =====================================

exports.openApplications = async (req, res) => {

    try {

        await RtseSetting.openApplications();

        req.flash(

            "success",

            "RTSE applications opened successfully."

        );

        res.redirect("/admin/rtse");

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to open applications."

        );

        res.redirect("/admin/rtse");

    }

};




// =====================================
// Publish Admit Cards
// =====================================

exports.publishAdmitCards = async (req, res) => {

    try {

        await RtseSetting.publishAdmitCards();

        req.flash(

            "success",

            "Admit Cards published successfully."

        );

        res.redirect("/admin/rtse");

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to publish Admit Cards."

        );

        res.redirect("/admin/rtse");

    }

};


// =====================================
// Hide Admit Cards
// =====================================

exports.hideAdmitCards = async (req, res) => {

    try {

        await RtseSetting.hideAdmitCards();

        req.flash(

            "success",

            "Admit Cards hidden successfully."

        );

        res.redirect("/admin/rtse");

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to hide Admit Cards."

        );

        res.redirect("/admin/rtse");

    }

};






// =====================================
// RTSE Examination Control Centre
// =====================================

// -------------------------------------
// Examination List
// -------------------------------------

exports.examSettingPage = async (req, res) => {

    try {

        const examinations =
            await RtseExamSetting.getAll();

        res.render(
            "admin/rtse/exam-settings",
            {
                title: "RTSE Examination Control Centre",
                examinations
            }
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load examinations."
        );

        res.redirect("/admin/rtse");
    }
};


// -------------------------------------
// New Examination Page
// -------------------------------------

exports.newExamSettingPage = async (req, res) => {

    res.render(
        "admin/rtse/exam-setting-form",
        {
            title: "Create RTSE Examination",
            examination: null,
            mode: "create"
        }
    );

};


// -------------------------------------
// Create Examination
// -------------------------------------

exports.createExamSetting = async (req, res) => {

    try {

        const examYear =
            Number(req.body.exam_year);

        if (
            !Number.isInteger(examYear) ||
            examYear < 2000 ||
            examYear > 2100
        ) {

            throw new Error(
                "Please enter a valid examination year."
            );

        }

        if (
            !String(req.body.exam_name || "").trim()
        ) {

            throw new Error(
                "Examination name is required."
            );

        }

        const examination =
            await RtseExamSetting.create({
                ...req.body,
                status: "INACTIVE"
            });

        req.flash(
            "success",
            `Examination "${examination.exam_name}" (${examination.exam_year}) created successfully.`
        );

        res.redirect(
            "/admin/rtse/exam-settings"
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            err.message ||
            "Unable to create examination."
        );

        res.redirect(
            "/admin/rtse/exam-settings/new"
        );
    }

};


// -------------------------------------
// View Examination
// -------------------------------------

exports.viewExamSetting = async (req, res) => {

    try {

        const examination =
            await RtseExamSetting.getById(
                req.params.id
            );

        if (!examination) {

            req.flash(
                "error",
                "Examination not found."
            );

            return res.redirect(
                "/admin/rtse/exam-settings"
            );
        }

        res.render(
            "admin/rtse/exam-setting-view",
            {
                title: "RTSE Examination Details",
                examination
            }
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load examination."
        );

        res.redirect(
            "/admin/rtse/exam-settings"
        );
    }

};


// -------------------------------------
// Edit Examination Page
// -------------------------------------

exports.editExamSettingPage = async (req, res) => {

    try {

        const examination =
            await RtseExamSetting.getById(
                req.params.id
            );

        if (!examination) {

            req.flash(
                "error",
                "Examination not found."
            );

            return res.redirect(
                "/admin/rtse/exam-settings"
            );
        }

        res.render(
            "admin/rtse/exam-setting-form",
            {
                title: "Edit RTSE Examination",
                examination,
                mode: "edit"
            }
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load examination."
        );

        res.redirect(
            "/admin/rtse/exam-settings"
        );
    }

};


// -------------------------------------
// Update Examination
// -------------------------------------

exports.updateExamSetting = async (req, res) => {

    try {

        const id =
            Number(req.params.id);

        const examination =
            await RtseExamSetting.getById(id);

        if (!examination) {

            throw new Error(
                "Examination not found."
            );

        }

        const examYear =
            Number(req.body.exam_year);

        if (
            !Number.isInteger(examYear) ||
            examYear < 2000 ||
            examYear > 2100
        ) {

            throw new Error(
                "Please enter a valid examination year."
            );

        }

        if (
            !String(req.body.exam_name || "").trim()
        ) {

            throw new Error(
                "Examination name is required."
            );

        }

        await RtseExamSetting.update(
            id,
            req.body
        );

        req.flash(
            "success",
            "Examination updated successfully."
        );

        res.redirect(
            "/admin/rtse/exam-settings"
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            err.message ||
            "Unable to update examination."
        );

        res.redirect(
            `/admin/rtse/exam-settings/${req.params.id}/edit`
        );
    }

};


// -------------------------------------
// Activate Examination
// -------------------------------------

exports.activateExamSetting = async (req, res) => {

    try {

        const id =
            Number(req.params.id);

        const examination =
            await RtseExamSetting.getById(id);

        if (!examination) {

            throw new Error(
                "Examination not found."
            );

        }

        await RtseExamSetting.activate(id);

        req.flash(
            "success",
            `${examination.exam_name} (${examination.exam_year}) is now the active RTSE examination.`
        );

        res.redirect(
            "/admin/rtse/exam-settings"
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            err.message ||
            "Unable to activate examination."
        );

        res.redirect(
            "/admin/rtse/exam-settings"
        );
    }

};


// -------------------------------------
// Deactivate Examination
// -------------------------------------

exports.deactivateExamSetting = async (req, res) => {

    try {

        const id =
            Number(req.params.id);

        const examination =
            await RtseExamSetting.getById(id);

        if (!examination) {

            throw new Error(
                "Examination not found."
            );

        }

        await RtseExamSetting.deactivate(id);

        req.flash(
            "success",
            `${examination.exam_name} (${examination.exam_year}) has been deactivated.`
        );

        res.redirect(
            "/admin/rtse/exam-settings"
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            err.message ||
            "Unable to deactivate examination."
        );

        res.redirect(
            "/admin/rtse/exam-settings"
        );
    }

};


// -------------------------------------
// Delete Examination
// -------------------------------------

exports.deleteExamSetting = async (req, res) => {

    try {

        const id =
            Number(req.params.id);

        const examination =
            await RtseExamSetting.getById(id);

        if (!examination) {

            throw new Error(
                "Examination not found."
            );

        }

        if (
            examination.status === "ACTIVE"
        ) {

            throw new Error(
                "The active examination cannot be deleted. Deactivate it first."
            );

        }

        await RtseExamSetting.delete(id);

        req.flash(
            "success",
            "Examination deleted successfully."
        );

        res.redirect(
            "/admin/rtse/exam-settings"
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            err.message ||
            "Unable to delete examination."
        );

        res.redirect(
            "/admin/rtse/exam-settings"
        );
    }

};

// =====================================
// Seat Plan Page
// =====================================

exports.seatPlanPage = async (req, res) => {

    try {

        res.render(

            "admin/rtse/seat-plan",

            {

                title: "RTSE Seat Plan"

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load Seat Plan."

        );

        res.redirect("/admin/rtse");

    }

};


// =====================================
// Generate Seat Plan
// =====================================

exports.generateSeatPlan = async (req, res) => {

    try {

        const section =
            String(req.body.section || "")
                .trim()
                .toUpperCase();

        const roomCapacity =
            parseInt(req.body.room_capacity, 10);

        const setting = await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        if(!Number.isInteger(roomCapacity) || roomCapacity < 1){
            throw new Error(
                "Invalid room capacity."
            );
        }

        await RtseSeatPlan.generate(
            section,
            roomCapacity,
            applicationYear
        );

        req.flash(
            "success",
            `Seat Plan generated successfully for Section ${section} (${applicationYear}).`
        );

        res.redirect("/admin/rtse/seat-plan");

    } catch(err){

        console.error(err);

        req.flash(
            "error",
            "Unable to generate Seat Plan."
        );

        res.redirect("/admin/rtse/seat-plan");
    }
};
// =====================================
// Room Wise Seat Plan
// =====================================

exports.roomWiseSeatPlan = async (req, res) => {

    try {

        const section =
            String(req.params.section || "")
                .trim()
                .toUpperCase();

        const setting = await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        const rooms =
            await RtseSeatPlan.getRoomWise(
                section,
                applicationYear
            );

        res.render(
            "admin/rtse/room-seat-plan",
            {
                title: "Room Wise Seat Plan",
                section,
                applicationYear,
                rooms
            }
        );

    } catch(err){

        console.error(err);

        req.flash(
            "error",
            "Unable to load Seat Plan."
        );

        res.redirect("/admin/rtse");
    }
};
// =====================================
// Invigilator Attendance Sheet
// =====================================

exports.attendanceSheet = async (req, res) => {

    try {

        const section =
            String(req.params.section || "")
                .trim()
                .toUpperCase();

        const setting = await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        const rooms =
            await RtseSeatPlan.getRoomWise(
                section,
                applicationYear
            );

        const examSetting =
            await RtseExamSetting.get();

        res.render(

            "admin/rtse/attendance-sheet",

            {

                title: "Invigilator Attendance Sheet",

                section: req.params.section,
                applicationYear,

                rooms,

                examSetting

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load Attendance Sheet."

        );

        res.redirect("/admin/rtse");

    }

};




// =====================================
// Reset Attendance to ABSENT
// =====================================

exports.markAttendanceAbsent = async (req, res) => {

    try {

        const applicationId =
            req.params.id;

        const attendance =
            await RtseExamAttendance.markAbsent(
                applicationId
            );

        // Remove any existing result because the candidate
        // is no longer PRESENT for the examination.
        await RtseResult.deleteByApplication(
            applicationId
        );

        if (!attendance) {

            req.flash(
                "error",
                "Attendance could not be reset."
            );

            return res.redirect(
                "/admin/rtse/results"
            );
        }

        req.flash(
            "success",
            "Attendance reset to ABSENT. Student returned to the RTSE Application Dashboard."
        );

        return res.redirect(
            "/admin/rtse/results"
        );

    } catch (err) {

        console.error(
            "Reset Attendance Error:",
            err
        );

        req.flash(
            "error",
            "Unable to reset attendance."
        );

        return res.redirect(
            "/admin/rtse/results"
        );
    }

};


// =====================================
// Result Dashboard
// =====================================

exports.resultDashboard = async (req, res) => {

    try {

        const search =
            String(req.query.search || "").trim();

        const section =
            String(req.query.section || "").trim();


        const setting =
            await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

const students =
            await RtseResult.getDashboardResults(
                search,
                section,
                "",
                applicationYear
            );
        const total =
            students.length;

        const entered =
            students.filter(
                student => student.result_id
            ).length;

        const pending =
            students.filter(
                student => !student.result_id
            ).length;

        res.render(
            "admin/rtse/result-dashboard",
            {
                title: "RTSE Result Dashboard",

                students,

                setting,

                search,

                section,

                stats: {
                    total,
                    entered,
                    pending
                }
            }
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load Result Dashboard."
        );

        return res.redirect(
            "/admin/rtse"
        );

    }

};


// =====================================
// Result Entry Page
// =====================================

exports.resultEntryPage = async (req, res) => {

    try {

        const student =
            await RtseApplication.getById(
                req.params.id
            );

        const result =
            await RtseResult.getByApplication(
                req.params.id
            );

        res.render(

            "admin/rtse/result-entry",

            {

                title:"Enter Result",

                student,

                result

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to load Result Entry."

        );

        res.redirect("/admin/rtse/results");

    }

};


// =====================================
// Save Result
// =====================================

exports.saveResult = async (req, res) => {

    try {

        const applicationId =
            req.params.id;

        const resultStatus =
            String(
                req.body.result_status || ""
            ).trim();

        // =====================================
        // Reset Result to Pending
        // =====================================

        if (resultStatus === "Pending") {

            await RtseResult.deleteByApplication(
                applicationId
            );

            req.flash(
                "success",
                "Result reset to Pending successfully."
            );

            return res.redirect(
                "/admin/rtse/results"
            );

        }

        // =====================================
        // Save / Update Result
        // =====================================

        const old =
            await RtseResult.getByApplication(
                applicationId
            );

        if (old) {

            await RtseResult.update(
                applicationId,
                req.body
            );

        } else {

            req.body.application_id =
                applicationId;

            await RtseResult.save(
                req.body
            );

        }

        req.flash(
            "success",
            "Result saved successfully."
        );

        return res.redirect(
            "/admin/rtse/results"
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to save result."
        );

        return res.redirect(
            "/admin/rtse/results"
        );

    }

};



// =====================================
// Reset Result to Pending
// =====================================

exports.resetResultPending = async (req, res) => {

    try {

        const applicationId =
            req.params.id;

        if (!applicationId) {

            req.flash(
                "error",
                "Invalid student application."
            );

            return res.redirect(
                "/admin/rtse/results"
            );

        }

        await RtseResult.deleteByApplication(
            applicationId
        );

        req.flash(
            "success",
            "Result reset to Pending successfully."
        );

        return res.redirect(
            "/admin/rtse/results"
        );

    } catch (err) {

        console.error(
            "Reset Result Pending Error:",
            err
        );

        req.flash(
            "error",
            "Unable to reset result."
        );

        return res.redirect(
            "/admin/rtse/results"
        );

    }

};


// =====================================
// Generate Rankings

// =====================================

exports.generateRankings = async (req, res) => {

    try {


        const setting =
            await RtseSetting.get();

        const applicationYear =
            Number(setting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

const sections = [

            "A",

            "B",

            "C",

            "D",

            "E"

        ];

        for (const section of sections) {

            await RtseResult.generateSectionRanks(
                section,
                applicationYear
            );

        }

        await RtseResult.generateOverallRank(
            applicationYear
        );

        req.flash(

            "success",

            "Section-wise and Overall Rankings generated successfully."

        );

        return res.redirect(

            "/admin/rtse/results"

        );

    }

    catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to generate rankings."

        );

        return res.redirect(

            "/admin/rtse/results"

        );

    }

};




// =====================================
// Overall Merit List
// =====================================

exports.overallMeritList = async (req,res)=>{

    try{


          const setting =
              await RtseSetting.get();

          const applicationYear =
              Number(setting?.exam_year);

          if(!applicationYear){
              throw new Error(
                  "Active RTSE exam year is not configured."
              );
          }

const students=

        await RtseResult.getOverallMeritList(
              applicationYear
          );

        res.render(

            "admin/rtse/overall-merit-list",

            {

                title:"Overall Merit List",

                students

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to load Merit List."

        );

        res.redirect("/admin/rtse/results");

    }

};



// =====================================
// Section Merit List
// =====================================

exports.sectionMeritList = async (req,res)=>{

    try{


          const setting =
              await RtseSetting.get();

          const applicationYear =
              Number(setting?.exam_year);

          if(!applicationYear){
              throw new Error(
                  "Active RTSE exam year is not configured."
              );
          }

const students=

        await RtseResult.getSectionMeritList(
              req.params.section,
              applicationYear
          );

        res.render(

            "admin/rtse/section-merit-list",

            {

                title:"Section Merit List",

                section:req.params.section,

                students

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to load Merit List."

        );

        res.redirect("/admin/rtse/results");

    }

};



// =====================================
// Publish Results
// =====================================

exports.publishResults = async (req, res) => {

    try {

        await RtseSetting.publishResults();

        req.flash(

            "success",

            "Results published successfully."

        );

        res.redirect("/admin/rtse/results");

    }

    catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to publish results."

        );

        res.redirect("/admin/rtse/results");

    }

};


// =====================================
// Hide Results
// =====================================

exports.hideResults = async (req, res) => {

    try {

        await RtseSetting.hideResults();

        req.flash(

            "success",

            "Results hidden successfully."

        );

        res.redirect("/admin/rtse/results");

    }

    catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to hide results."

        );

        res.redirect("/admin/rtse/results");

    }

};



// =====================================
// Generate Certificate
// =====================================

exports.generateCertificate = async (req,res)=>{

    try{

        await RtseCertificateService.generate(

            req.params.id,

            `${req.protocol}://${req.get("host")}`

        );

        req.flash(

            "success",

            "Certificate generated successfully."

        );

    }catch(err){

        req.flash(

            "error",

            err.message

        );

    }

    res.redirect("/admin/rtse/results");

};


// =====================================
// View Certificate
// =====================================

exports.viewCertificate = async (req, res) => {

    try {

        const certificate =
            await RtseCertificate.getByApplication(
                req.params.id
            );

        if (!certificate) {

            req.flash(
                "error",
                "Certificate not found."
            );

            return res.redirect("/admin/rtse/results");

        }

        const setting =
            await RtseExamSetting.get();

        res.render(

            "rtse/certificate",

            {

                title: "RTSE Certificate",

                certificate,

                setting

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load certificate."
        );

        res.redirect("/admin/rtse/results");

    }

};



// =====================================
// Publish Certificates
// =====================================

exports.publishCertificates = async (req,res)=>{

    try{

        await RtseSetting.publishCertificates();

        req.flash(

            "success",

            "Certificates published successfully."

        );

        res.redirect(

            "/admin/rtse/results"

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to publish certificates."

        );

        res.redirect(

            "/admin/rtse/results"

        );

    }

};



// =====================================
// Hide Certificates
// =====================================

exports.hideCertificates = async (req,res)=>{

    try{

        await RtseSetting.hideCertificates();

        req.flash(

            "success",

            "Certificates hidden successfully."

        );

        res.redirect(

            "/admin/rtse/results"

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to hide certificates."

        );

        res.redirect(

            "/admin/rtse/results"

        );

    }

};



// =====================================
// Bulk Certificate Generator
// =====================================

exports.generateCertificates = async (req,res)=>{

    try{

                const rtseSetting =
            await RtseSetting.get();

        const applicationYear =
            Number(rtseSetting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

const students =

        await RtseCertificate.getPendingStudents(
              req.params.section || null,
              applicationYear
          );

        let total = 0;

        for(const student of students){

            const generated =

            await RtseCertificateService.generate(

                student.id,

                `${req.protocol}://${req.get("host")}`

            );

            if(generated){

                total++;

            }

        }

        req.flash(

            "success",

            `${total} certificates generated successfully.`

        );

    }catch(err){

        req.flash(

            "error",

            err.message

        );

    }

    res.redirect("/admin/rtse/results");

};



// =====================================
// Section Certificate PDF
// =====================================

exports.sectionCertificates = async (req,res)=>{

    try{

                const rtseSetting =
            await RtseSetting.get();

        const applicationYear =
            Number(rtseSetting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

const certificates=

        await RtseCertificate.getBySection(
              req.params.section,
              applicationYear
          );

        const setting=

        await RtseExamSetting.get();

        res.render(

            "admin/rtse/section-certificates",

            {

                title:"Section Certificates",

                certificates,

                setting,

                section:req.params.section

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to load certificates."

        );

        res.redirect(

            "/admin/rtse/results"

        );

    }

};



// =====================================
// All Certificates
// =====================================

exports.allCertificates = async (req,res)=>{

    try{

        const rtseSetting =
            await RtseSetting.get();

        const applicationYear =
            Number(rtseSetting?.exam_year);

        if(!applicationYear){
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        const certificates =
            await RtseCertificate.getAll(
                applicationYear
            );

        const setting =
            await RtseExamSetting.get();

        res.render(

            "admin/rtse/all-certificates",

            {

                title:"All Certificates",

                certificates,

                setting

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to load certificates."

        );

        res.redirect(

            "/admin/rtse/results"

        );

    }

};
