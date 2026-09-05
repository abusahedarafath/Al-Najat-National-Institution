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
const RtseCentre = require("../models/RtseCentre");
const { generateRoomTokenPdfs } =
require("../utils/rtseSeatTokenPdf");

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
// =====================================
// RTSE Admin Photo Compression
// =====================================
const RTSE_UPLOAD_DIR = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    "rtse"
);

function safeRtsePhotoPath(filename) {
    if (!filename) {
        return null;
    }

    const safeName = path.basename(String(filename));

    if (!safeName || safeName !== String(filename)) {
        return null;
    }

    return path.join(RTSE_UPLOAD_DIR, safeName);
}

async function saveCompressedRtseAdminPhoto(file) {
    if (!file || !file.buffer) {
        return null;
    }

    fs.mkdirSync(RTSE_UPLOAD_DIR, { recursive: true });

    const filename =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1000000000) +
        ".jpg";

    const outputPath = path.join(
        RTSE_UPLOAD_DIR,
        filename
    );

    try {
        await sharp(file.buffer)
            .rotate()
            .resize({
                width: 600,
                height: 800,
                fit: "inside",
                withoutEnlargement: true
            })
            .jpeg({
                quality: 78,
                mozjpeg: true
            })
            .toFile(outputPath);

        return filename;
    } catch (error) {
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }

        throw new Error(
            "The selected candidate photo could not be processed."
        );
    }
}

function deleteRtseAdminPhoto(filename) {
    const filePath = safeRtsePhotoPath(filename);

    if (!filePath || !fs.existsSync(filePath)) {
        return;
    }

    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error(
            "Unable to remove replaced RTSE photo:",
            error
        );
    }
}

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

                male: stats.male || 0,

                female: stats.female || 0,

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

        res.redirect("/admin/rtse/applications");

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to approve application."

        );

        res.redirect("/admin/rtse/applications");

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

        res.redirect("/admin/rtse/applications");

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to reject application."

        );

        res.redirect("/admin/rtse/applications");

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
    let newPhotoFilename = null;

    try {
        const existingApplication =
            await RtseApplication.getById(req.params.id);

        if (!existingApplication) {
            req.flash("error", "Application not found.");
            return res.redirect("/admin/rtse");
        }

        // Replace the photo only when the administrator
        // explicitly uploads a new image.
        if (req.file) {
            newPhotoFilename =
                await saveCompressedRtseAdminPhoto(req.file);
        }

        await RtseApplication.update(
            req.params.id,
            req.body,
            newPhotoFilename
        );

        // Delete the previous photo only after the database
        // update succeeds.
        if (
            newPhotoFilename &&
            existingApplication.photo &&
            existingApplication.photo !== newPhotoFilename
        ) {
            deleteRtseAdminPhoto(existingApplication.photo);
        }

        req.flash(
            "success",
            "Application updated successfully."
        );

        res.redirect(
            "/admin/rtse/application/" +
            req.params.id
        );
    } catch (err) {
        // Preserve the old photo if the update fails.
        if (newPhotoFilename) {
            deleteRtseAdminPhoto(newPhotoFilename);
        }

        console.error(err);

        req.flash(
            "error",
            err && err.message
                ? err.message
                : "Unable to update application."
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

        // Resolve the student's examination shift from the
        // shift-wise sections configured under Examination Settings.
        // The admit card must not depend on seat-plan shift assignment.
        let examShift = null;
        if (examSetting && student.section) {
            const configuredShifts =
                await RtseExamSetting.getShifts(examSetting.id);

            const studentSection =
                String(student.section).trim().toUpperCase();

            examShift = configuredShifts.find((shift) =>
                Array.isArray(shift.sections) &&
                shift.sections.some((section) =>
                    String(section.section || "").trim().toUpperCase() ===
                    studentSection
                )
            ) || null;
        }

        // Resolve the examination centre from the student's
        // registered school and its centre assignment.
        let examCentre = null;

        if (student.school_id && student.application_year) {
            examCentre =
                await RtseCentre.getSchoolAssignment(
                    student.school_id,
                    student.application_year
                );
        }

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
                examShift,
                examCentre,
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







function normalizeExamTime(value) {
    const raw = String(value || "").trim();

    if (!raw) {
        return null;
    }

    // Accept normal 12-hour format:
    // 10:30 AM
    // 2:00 PM
    // 10 PM
    const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);

    if (!match) {
        throw new Error(
            `Invalid examination time "${raw}". Please use a format such as 10:30 PM.`
        );
    }

    let hour = Number(match[1]);
    const minute = Number(match[2] || "00");
    const meridiem = match[3].toUpperCase();

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
        throw new Error(
            `Invalid examination time "${raw}". Please use a format such as 10:30 PM.`
        );
    }

    if (meridiem === "AM") {
        if (hour === 12) hour = 0;
    } else {
        if (hour !== 12) hour += 12;
    }

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function normalizeExamShifts(body) {
    let raw = body.exam_shifts || [];

    if (!Array.isArray(raw)) {
        raw = [raw];
    }

    const seenShiftIds = new Set();

    return raw.map((item, index) => {
        const shiftId = Number(item.shift_id);

        if (!Number.isInteger(shiftId) || shiftId <= 0) {
            throw new Error(
                `Please select a valid shift for Shift ${index + 1}.`
            );
        }

        if (seenShiftIds.has(shiftId)) {
            throw new Error(
                `The same examination shift cannot be selected more than once.`
            );
        }

        seenShiftIds.add(shiftId);

        let sections = item.sections || [];

        if (!Array.isArray(sections)) {
            sections = [sections];
        }

        sections = [
            ...new Set(
                sections
                    .map(value =>
                        String(value || "").trim().toUpperCase()
                    )
                    .filter(Boolean)
            )
        ];

        const allowedSections = ["A", "B", "C", "D", "E"];

        for (const section of sections) {
            if (!allowedSections.includes(section)) {
                throw new Error(
                    `Invalid section "${section}" in Shift ${index + 1}.`
                );
            }
        }

        return {
            shift_id: shiftId,
            reporting_time: normalizeExamTime(item.reporting_time),
            exam_start_time: normalizeExamTime(item.exam_start_time),
            exam_end_time: normalizeExamTime(item.exam_end_time),
            sections
        };
    });
}

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
    try {
        const db = require("../config/database");

        const [shifts] = await db.query(`
            SELECT
                id,
                shift_no,
                shift_name,
                is_active,
                layout
            FROM rtse_seat_plan_shifts
            WHERE is_active=1
            ORDER BY shift_no ASC
        `);

        res.render(
            "admin/rtse/exam-setting-form",
            {
                title: "Create RTSE Examination",
                examination: null,
                mode: "create",
                shifts,
                examShifts: []
            }
        );
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load examination form.");
        res.redirect("/admin/rtse/exam-settings");
    }
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

        const examShifts =
            normalizeExamShifts(req.body);

        const examination =
            await RtseExamSetting.create({
                ...req.body,
                status: "INACTIVE"
            });

        await RtseExamSetting.saveShifts(
            examination.id,
            examShifts
        );

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
            await RtseExamSetting.getById(req.params.id);

        if (!examination) {
            req.flash("error", "Examination not found.");
            return res.redirect("/admin/rtse/exam-settings");
        }

        const db = require("../config/database");

        const [shifts] = await db.query(`
            SELECT
                id,
                shift_no,
                shift_name,
                is_active,
                layout
            FROM rtse_seat_plan_shifts
            WHERE is_active=1
            ORDER BY shift_no ASC
        `);

        const examShifts =
            await RtseExamSetting.getShifts(examination.id);

        res.render(
            "admin/rtse/exam-setting-form",
            {
                title: "Edit RTSE Examination",
                examination,
                mode: "edit",
                shifts,
                examShifts
            }
        );
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load examination.");
        res.redirect("/admin/rtse/exam-settings");
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

        const examShifts =
            normalizeExamShifts(req.body);

        await RtseExamSetting.update(
            id,
            {
                ...req.body,

                // Legacy global timing/centre fields are no longer
                // used by the examination settings form. Preserve
                // existing values instead of replacing them with NULL.
                reporting_time: examination.reporting_time,
                exam_start_time: examination.exam_start_time,
                exam_end_time: examination.exam_end_time,
                exam_centre: examination.exam_centre
            }
        );

        await RtseExamSetting.saveShifts(
            id,
            examShifts
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

// =====================================
// =====================================
// Seat Designer
// =====================================

exports.seatDesignerPage = async (req, res) => {
    try {
        const shiftId = parseInt(req.params.shiftId, 10);
        const roomId = parseInt(req.params.roomId, 10);

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        if (
            !Number.isInteger(shiftId) ||
            shiftId < 1 ||
            !Number.isInteger(roomId) ||
            roomId < 1
        ) {
            throw new Error("Invalid shift or room.");
        }

        const shift = await RtseSeatPlan.getSeatDesigner(
            shiftId,
            roomId,
            applicationYear
        );

        if (!shift) {
            throw new Error("Shift or room not found.");
        }

        const pdfResult = await generateRoomTokenPdfs(
            shiftId,
            roomId,
            applicationYear
        );

        res.render(
            "admin/rtse/seat-designer",
            {
                title: "Seat Designer",
                applicationYear,
                shiftId,
                roomId,
                shift,
                pdfResult,
                tokenAllocatedCount: 0
            }
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err.message || "Unable to load Seat Designer."
        );

        res.redirect("/admin/rtse/seat-plan");
    }
};


exports.generateSeatDesigner = async (req, res) => {
    try {
        const shiftId = parseInt(req.params.shiftId, 10);
        const roomId = parseInt(req.params.roomId, 10);

        const layout = String(
            req.body.layout || "TWO_SIDE"
        ).trim().toUpperCase();

        const rowCount = parseInt(
            req.body.row_count,
            10
        );

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        await RtseSeatPlan.setSeatLayout(
            shiftId,
            roomId,
            applicationYear,
            layout,
            rowCount,
            4
        );

        req.flash(
            "success",
            "Seat layout generated successfully."
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err.message || "Unable to generate seat layout."
        );
    }

    res.redirect(
        `/admin/rtse/seat-plan/shifts/${req.params.shiftId}/rooms/${req.params.roomId}/seats`
    );
};


exports.updateRoomSeatSystem = async (req, res) => {
    try {
        const shiftId = parseInt(req.params.shiftId, 10);
        const roomId = parseInt(req.params.roomId, 10);

        const seatSystem = String(
            req.body.seat_system || "FULL"
        ).trim().toUpperCase();

        if (!["FULL", "CORNER_TO_CORNER"].includes(seatSystem)) {
            throw new Error("Invalid seat system.");
        }

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        await RtseSeatPlan.updateRoomSeatSystem(
            shiftId,
            roomId,
            applicationYear,
            seatSystem
        );

        req.flash(
            "success",
            seatSystem === "CORNER_TO_CORNER"
                ? "Corner-to-Corner seat system enabled."
                : "Full Seat System enabled."
        );
    } catch (err) {
        console.error("RTSE room seat system error:", err);

        req.flash(
            "error",
            err.message || "Unable to update seat system."
        );
    }

    res.redirect(
        `/admin/rtse/seat-plan/shifts/${req.params.shiftId}/rooms/${req.params.roomId}/seats`
    );
};

exports.updateSeatDesignerSeat = async (req, res) => {
    try {
        const shiftId = parseInt(req.params.shiftId, 10);
        const roomId = parseInt(req.params.roomId, 10);
        const seatId = parseInt(req.params.seatId, 10);

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        /*
         * Reset means actual unlock/release, not merely clearing
         * the visual restriction.
         */
        if (req.body.reset_seat === "1") {
            const result =
                await RtseSeatPlan.unlockSeatAndResetAssignment(
                    seatId,
                    shiftId,
                    roomId,
                    applicationYear
                );

            const pdfResult =
                await generateRoomTokenPdfs(
                    shiftId,
                    roomId,
                    applicationYear
                );

            if (result.released > 0) {
                req.flash(
                    "success",
                    "Seat unlocked and its student assignment was released."
                );
            } else {
                req.flash(
                    "success",
                    "Seat unlocked."
                );
            }

            /*
             * The PDF generator removes stale room PDFs when there
             * are no remaining locked student seats.
             */
            if (pdfResult.files.length) {
                const designerShift = await RtseSeatPlan.getSeatDesigner(
                    shiftId,
                    roomId,
                    applicationYear
                );

                return res.render("admin/rtse/seat-designer", {
                    title: "Seat Designer",
                    applicationYear,
                    shiftId,
                    roomId,
                    shift: designerShift,
                    pdfResult,
                    tokenAllocatedCount: 0
                });
            }

            return res.redirect(
                `/admin/rtse/seat-plan/shifts/${req.params.shiftId}/rooms/${req.params.roomId}/seats`
            );
        }

        const sectionValue = String(
            req.body.section || ""
        ).trim().toUpperCase();

        const section =
            sectionValue === ""
                ? null
                : sectionValue;

        const gender = String(
            req.body.gender || "Any"
        ).trim();

        /*
         * When the effective Gender + Section combination is complete,
         * this operation becomes an individual-seat allocation/lock.
         *
         * When incomplete, it remains the existing configuration-only
         * behavior.
         */
        const allocation =
            await RtseSeatPlan.allocateStudentToSpecificSeat(
                seatId,
                shiftId,
                roomId,
                applicationYear,
                section,
                gender
            );

        if (allocation.complete) {
            if (allocation.allocated) {
                const designerShift = await RtseSeatPlan.getSeatDesigner(
                    shiftId,
                    roomId,
                    applicationYear
                );

                const generatedPdfResult =
                    await generateRoomTokenPdfs(
                        shiftId,
                        roomId,
                        applicationYear
                    );

                /*
                 * Individual-seat PDF selection must follow the actual
                 * room seat system, not the selected seat position.
                 *
                 * FULL:
                 *   expose only FULL.pdf -> A4 landscape.
                 *
                 * CORNER_TO_CORNER:
                 *   expose LEFT/RIGHT PDFs -> A4 portrait.
                 *
                 * Universal Lock uses its own existing PDF result path
                 * and is intentionally not changed here.
                 */
                const roomSeatSystem =
                    String(designerShift?.seat_system || "")
                        .trim()
                        .toUpperCase();

                const pdfResult =
                    roomSeatSystem === "FULL"
                        ? {
                            seatSystem: "FULL",
                            files: generatedPdfResult.files.filter(
                                file =>
                                    String(file.side || "")
                                        .trim()
                                        .toUpperCase() === "FULL"
                            )
                        }
                        : {
                            seatSystem: roomSeatSystem,
                            files: generatedPdfResult.files
                        };

                return res.render("admin/rtse/seat-designer", {
                    title: "Seat Designer",
                    applicationYear,
                    shiftId,
                    roomId,
                    shift: designerShift,
                    pdfResult,
                    tokenAllocatedCount: 1
                });
            }

            if (allocation.reason === "no_student") {
                throw new Error(
                    `No remaining approved ${allocation.gender} student was found for Section ${allocation.section}.`
                );
            }

            if (allocation.reason === "configured") {
                throw new Error(
                    "This seat is already configured and cannot be overwritten."
                );
            }
        }

        /*
         * Partial Gender/Section remains a normal restriction.
         */
        await RtseSeatPlan.updateSeat(
            seatId,
            shiftId,
            roomId,
            applicationYear,
            section,
            gender
        );

        req.flash(
            "success",
            "Seat configuration updated."
        );
    } catch (err) {
        console.error(
            "RTSE individual seat lock error:",
            err
        );

        req.flash(
            "error",
            err.message || "Unable to update seat."
        );
    }

    return res.redirect(
        `/admin/rtse/seat-plan/shifts/${req.params.shiftId}/rooms/${req.params.roomId}/seats`
    );
};




exports.lockRoomSeatsAndGenerateTokens = async (req, res) => {
    try {
        const shiftId = parseInt(req.params.shiftId, 10);
        const roomId = parseInt(req.params.roomId, 10);

        const gender = String(req.body.gender_lock || "").trim();
        const section = String(req.body.section_lock || "")
            .trim()
            .toUpperCase();

        if (!["Male", "Female"].includes(gender)) {
            throw new Error("A valid gender is required.");
        }

        if (!["A", "B", "C", "D", "E"].includes(section)) {
            throw new Error("A valid section is required.");
        }

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        /*
         * Lock is the complete operation:
         * Gender + Section -> allocate next unassigned students
         * -> lock only occupied seats.
         *
         * LEFT is filled first, then RIGHT. Each side allocation is
         * bounded by the number of matching students and available seats.
         */
        const leftResult =
            await RtseSeatPlan.allocateGenderSectionToSide(
                shiftId,
                roomId,
                applicationYear,
                "LEFT",
                gender,
                section
            );

        const remainingStudents = Number(
            leftResult.remainingStudents || 0
        );

        let rightResult = null;

        if (remainingStudents > 0) {
            rightResult =
                await RtseSeatPlan.allocateGenderSectionToSide(
                    shiftId,
                    roomId,
                    applicationYear,
                    "RIGHT",
                    gender,
                    section
                );
        }

        const allocatedCount =
            Number(leftResult.allocated || 0) +
            Number(rightResult?.allocated || 0);

        if (allocatedCount === 0) {
            throw new Error(
                `No available seats or no remaining approved ${gender} students for Section ${section}.`
            );
        }

        const pdfResult =
            await generateRoomTokenPdfs(
                shiftId,
                roomId,
                applicationYear
            );

        const room = leftResult.room || rightResult?.room;

        const designerShift = await RtseSeatPlan.getSeatDesigner(
            shiftId,
            roomId,
            applicationYear
        );

        res.render("admin/rtse/seat-designer", {
            title: "Seat Designer",
            applicationYear,
            shiftId,
            roomId,
            shift: designerShift,
            pdfResult,
            tokenAllocatedCount: allocatedCount
        });
    } catch (err) {
        console.error(
            "RTSE seat lock/token PDF error:",
            err
        );

        req.flash(
            "error",
            err.message ||
            "Unable to allocate students, lock seats and generate token PDF."
        );

        return res.redirect(
            `/admin/rtse/seat-plan/shifts/${req.params.shiftId}/rooms/${req.params.roomId}/seats`
        );
    }
};


exports.updateSeatSideLocks = async (req, res) => {
    try {
        const shiftId = parseInt(req.params.shiftId, 10);
        const roomId = parseInt(req.params.roomId, 10);

        const side = String(req.body.side || "")
            .trim()
            .toUpperCase();

        const genderValue = String(req.body.gender_lock || "")
            .trim();

        const sectionValue = String(req.body.section_lock || "")
            .trim()
            .toUpperCase();

        const genderLock =
            ["Male", "Female"].includes(genderValue)
                ? genderValue
                : null;

        const sectionLock =
            ["A", "B", "C", "D", "E"].includes(sectionValue)
                ? sectionValue
                : null;

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        /*
         * Unlock:
         * release only students/seats physically assigned to this
         * exact side, clear the side lock, then regenerate the room
         * token PDFs so stale tokens disappear.
         */
        if (!genderLock && !sectionLock) {
            const result =
                await RtseSeatPlan.unlockRoomSideAndResetAssignments(
                    shiftId,
                    roomId,
                    applicationYear,
                    side
                );

            const pdfResult =
                await generateRoomTokenPdfs(
                    shiftId,
                    roomId,
                    applicationYear
                );

            if (result.released > 0) {
                req.flash(
                    "success",
                    `${side} side unlocked and ${result.released} student seat assignment(s) released.`
                );
            } else {
                req.flash(
                    "success",
                    `${side} side unlocked.`
                );
            }

            /*
             * PDF generation is intentionally performed even when
             * nothing remains assigned. The generator removes stale
             * files for this room in that case.
             */
            if (pdfResult.files.length) {
                const designerShift = await RtseSeatPlan.getSeatDesigner(
                    shiftId,
                    roomId,
                    applicationYear
                );

                return res.render("admin/rtse/seat-designer", {
                    title: "Seat Designer",
                    applicationYear,
                    shiftId,
                    roomId,
                    shift: designerShift,
                    pdfResult,
                    tokenAllocatedCount: 0
                });
            }

            return res.redirect(
                `/admin/rtse/seat-plan/shifts/${req.params.shiftId}/rooms/${req.params.roomId}/seats`
            );
        }

        /*
         * Partial side locks remain configuration-only.
         */
        if (!genderLock || !sectionLock) {
            await RtseSeatPlan.updateRoomSideLocks(
                shiftId,
                roomId,
                applicationYear,
                side,
                genderLock,
                sectionLock
            );

            req.flash(
                "success",
                `${side} side lock settings updated.`
            );

            return res.redirect(
                `/admin/rtse/seat-plan/shifts/${req.params.shiftId}/rooms/${req.params.roomId}/seats`
            );
        }

        /*
         * Complete Gender + Section:
         * allocate only as many matching students as available seats,
         * persist the side lock, and immediately generate the token PDF.
         */
        const result =
            await RtseSeatPlan.allocateGenderSectionToSide(
                shiftId,
                roomId,
                applicationYear,
                side,
                genderLock,
                sectionLock
            );

        if (result.allocated > 0) {
            await RtseSeatPlan.updateRoomSideLocks(
                shiftId,
                roomId,
                applicationYear,
                side,
                genderLock,
                sectionLock
            );

            const pdfResult =
                await generateRoomTokenPdfs(
                    shiftId,
                    roomId,
                    applicationYear
                );

            const designerShift = await RtseSeatPlan.getSeatDesigner(
                shiftId,
                roomId,
                applicationYear
            );

            return res.render("admin/rtse/seat-designer", {
                title: "Seat Designer",
                applicationYear,
                shiftId,
                roomId,
                shift: designerShift,
                pdfResult,
                tokenAllocatedCount: result.allocated
            });
        }

        if (result.eligibleStudents === 0) {
            req.flash(
                "warning",
                `No remaining approved ${genderLock} students were found for Section ${sectionLock}.`
            );
        } else if (result.availableSeats === 0) {
            req.flash(
                "warning",
                `No available seats remain on the ${side} side.`
            );
        } else {
            req.flash(
                "warning",
                `No ${genderLock} Section ${sectionLock} students were allocated.`
            );
        }
    } catch (err) {
        console.error(
            "RTSE side lock/allocation error:",
            err
        );

        req.flash(
            "error",
            err.message || "Unable to apply side lock."
        );
    }

    return res.redirect(
        `/admin/rtse/seat-plan/shifts/${req.params.shiftId}/rooms/${req.params.roomId}/seats`
    );
};

exports.clearSeatDesigner = async (req, res) => {
    try {
        const shiftId = parseInt(req.params.shiftId, 10);
        const roomId = parseInt(req.params.roomId, 10);

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        await RtseSeatPlan.clearSeats(
            shiftId,
            roomId,
            applicationYear
        );

        req.flash(
            "success",
            "Seat layout cleared."
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err.message || "Unable to clear seat layout."
        );
    }

    res.redirect(
        `/admin/rtse/seat-plan/shifts/${req.params.shiftId}/rooms/${req.params.roomId}/seats`
    );
};


// =====================================

// =====================================
// Seat Plan Page
// =====================================

exports.seatPlanPage = async (req, res) => {
    try {
        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        const shifts =
            await RtseSeatPlan.getAllocationData(
                applicationYear
            );

        res.render(
            "admin/rtse/seat-plan",
            {
                title: "RTSE Seat Plan",
                applicationYear,
                shifts
            }
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err.message || "Unable to load Seat Plan."
        );

        res.redirect("/admin/rtse");
    }
};


exports.addSeatPlanShift = async (req, res) => {
    try {
        const body =
            req.body && typeof req.body === "object"
                ? req.body
                : {};

        const shiftName = String(
            body.shift_name || ""
        ).trim();

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        const shiftId = await RtseSeatPlan.addShift(
            applicationYear,
            shiftName || null
        );

        if (!shiftId) {
            throw new Error("Unable to create shift.");
        }

        req.flash(
            "success",
            "Shift added successfully."
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err?.code === "ER_DUP_ENTRY"
                ? "That shift number already exists."
                : (
                    err.message ||
                    "Unable to add shift."
                )
        );
    }

    res.redirect("/admin/rtse/seat-plan");
};


exports.editSeatPlanShift = async (req, res) => {
    try {
        const shiftId = parseInt(
            req.params.shiftId,
            10
        );

        const shiftName = String(
            req.body.shift_name || ""
        ).trim();

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        if (!Number.isInteger(shiftId) || shiftId < 1) {
            throw new Error("Invalid shift.");
        }

        if (!shiftName) {
            throw new Error("Shift name is required.");
        }

        await RtseSeatPlan.updateShift(
            shiftId,
            applicationYear,
            shiftName
        );

        req.flash(
            "success",
            "Shift updated successfully."
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err.message || "Unable to update shift."
        );
    }

    res.redirect("/admin/rtse/seat-plan");
};


exports.removeSeatPlanShift = async (req, res) => {
    try {
        const shiftId = parseInt(
            req.params.shiftId,
            10
        );

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        if (!Number.isInteger(shiftId) || shiftId < 1) {
            throw new Error("Invalid shift.");
        }

        await RtseSeatPlan.removeShift(
            shiftId,
            applicationYear
        );

        req.flash(
            "success",
            "Shift removed successfully."
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err.message || "Unable to remove shift."
        );
    }

    res.redirect("/admin/rtse/seat-plan");
};


exports.toggleSeatPlanShift = async (req, res) => {
    try {
        const shiftId = parseInt(
            req.params.shiftId,
            10
        );

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        if (!Number.isInteger(shiftId) || shiftId < 1) {
            throw new Error("Invalid shift.");
        }

        await RtseSeatPlan.toggleShift(
            shiftId,
            applicationYear
        );

        req.flash(
            "success",
            "Shift status updated."
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err.message || "Unable to update shift status."
        );
    }

    res.redirect("/admin/rtse/seat-plan");
};


exports.addSeatPlanRoom = async (req, res) => {
    try {
        const shiftId = parseInt(
            req.params.shiftId,
            10
        );

        const body =
            req.body && typeof req.body === "object"
                ? req.body
                : {};

        const roomNo = parseInt(
            body.room_no,
            10
        );

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        if (!Number.isInteger(shiftId) || shiftId < 1) {
            throw new Error("Invalid shift.");
        }

        if (!Number.isInteger(roomNo) || roomNo < 1) {
            throw new Error("Invalid room number.");
        }

        const roomId = await RtseSeatPlan.addRoom(
            shiftId,
            applicationYear,
            roomNo
        );

        if (!roomId) {
            throw new Error(
                "Shift not found for the active RTSE exam."
            );
        }

        req.flash(
            "success",
            `Room ${roomNo} added successfully.`
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err?.code === "ER_DUP_ENTRY"
                ? "That room number already exists for this RTSE exam."
                : (
                    err.message ||
                    "Unable to add room."
                )
        );
    }

    res.redirect("/admin/rtse/seat-plan");
};


exports.editSeatPlanRoom = async (req, res) => {
    try {
        const shiftId = parseInt(
            req.params.shiftId,
            10
        );

        const roomId = parseInt(
            req.params.roomId,
            10
        );

        const body =
            req.body && typeof req.body === "object"
                ? req.body
                : {};

        const roomNo = parseInt(
            body.room_no,
            10
        );

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        if (
            !Number.isInteger(shiftId) ||
            shiftId < 1
        ) {
            throw new Error("Invalid shift.");
        }

        if (
            !Number.isInteger(roomId) ||
            roomId < 1
        ) {
            throw new Error("Invalid room.");
        }

        if (
            !Number.isInteger(roomNo) ||
            roomNo < 1
        ) {
            throw new Error("Invalid room number.");
        }

        await RtseSeatPlan.updateRoom(
            roomId,
            shiftId,
            applicationYear,
            roomNo
        );

        req.flash(
            "success",
            `Room number updated to ${roomNo}.`
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err?.code === "ER_DUP_ENTRY"
                ? "That room number already exists for this RTSE exam."
                : (
                    err.message ||
                    "Unable to update room."
                )
        );
    }

    res.redirect("/admin/rtse/seat-plan");
};


exports.removeSeatPlanRoom = async (req, res) => {
    try {
        const shiftId = parseInt(
            req.params.shiftId,
            10
        );

        const roomId = parseInt(
            req.params.roomId,
            10
        );

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        await RtseSeatPlan.removeRoom(
            roomId,
            shiftId,
            applicationYear
        );

        req.flash(
            "success",
            "Room removed successfully."
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err.message || "Unable to remove room."
        );
    }

    res.redirect("/admin/rtse/seat-plan");
};


exports.toggleSeatPlanRoom = async (req, res) => {
    try {
        const shiftId = parseInt(
            req.params.shiftId,
            10
        );

        const roomId = parseInt(
            req.params.roomId,
            10
        );

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        await RtseSeatPlan.toggleRoom(
            roomId,
            shiftId,
            applicationYear
        );

        req.flash(
            "success",
            "Room status updated."
        );
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err.message || "Unable to update room status."
        );
    }

    res.redirect("/admin/rtse/seat-plan");
};


exports.generateSeatPlan = async (req, res) => {
    try {
        const section = String(
            req.body.section || ""
        ).trim().toUpperCase();

        const roomCapacity = parseInt(
            req.body.room_capacity,
            10
        );

        const setting = await RtseSetting.get();
        const applicationYear = Number(setting?.exam_year);

        if (!applicationYear) {
            throw new Error(
                "Active RTSE exam year is not configured."
            );
        }

        if (
            !Number.isInteger(roomCapacity) ||
            roomCapacity < 1
        ) {
            throw new Error("Invalid room capacity.");
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
    } catch (err) {
        console.error(err);

        req.flash(
            "error",
            err.message || "Unable to generate Seat Plan."
        );
    }

    res.redirect("/admin/rtse/seat-plan");
};

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
// Attendance Status Reset
// =====================================

exports.resetAttendanceStatus = async (req, res) => {

    try {
        const applicationId = req.params.id;

        const attendance =
            await RtseExamAttendance.resetAttendanceStatus(
                applicationId
            );

        if (!attendance) {
            req.flash(
                "error",
                "Attendance Status Reset could not be completed. The student may already be NOT SCANNED."
            );

            return res.redirect(
                "/admin/rtse/results"
            );
        }

        // A student must not retain a result after
        // their PRESENT attendance has been reset.
        await RtseResult.deleteByApplication(
            applicationId
        );

        req.flash(
            "success",
            "Attendance Status Reset successfully. Student is now NOT SCANNED and can be scanned again."
        );

        return res.redirect(
            "/admin/rtse/results"
        );
    } catch (err) {
        console.error(
            "Attendance Status Reset Error:",
            err
        );

        req.flash(
            "error",
            "Unable to reset attendance status."
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
            String(req.params.id || "").trim();

        if (!applicationId) {

            req.flash(
                "error",
                "Invalid student application."
            );

            return res.redirect(
                "/admin/rtse/results"
            );
        }

        /*
         * Express body-parser is configured globally in server.js,
         * but normalize the body here so this controller never crashes
         * merely because a malformed/empty request reaches the route.
         */
        const body =
            req.body && typeof req.body === "object"
                ? req.body
                : {};

        const resultStatus =
            String(
                body.result_status || ""
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
        // Validate Result Input
        // =====================================

        const fullMarks =
            Number(body.full_marks);

        const marks =
            Number(body.marks);

        if (
            !Number.isFinite(fullMarks) ||
            fullMarks <= 0
        ) {

            req.flash(
                "error",
                "Invalid full marks."
            );

            return res.redirect(
                `/admin/rtse/result/${encodeURIComponent(applicationId)}`
            );
        }

        if (
            !Number.isFinite(marks) ||
            marks < 0 ||
            marks > fullMarks
        ) {

            req.flash(
                "error",
                "Invalid obtained marks."
            );

            return res.redirect(
                `/admin/rtse/result/${encodeURIComponent(applicationId)}`
            );
        }

        // =====================================
        // Calculate Percentage Server-side
        // =====================================

        const percentage =
            Number(
                ((marks / fullMarks) * 100).toFixed(2)
            );

        // =====================================
        // Calculate Grade Server-side
        // =====================================

        let grade;

        if (percentage >= 90) {
            grade = "A+";
        } else if (percentage >= 80) {
            grade = "A";
        } else if (percentage >= 70) {
            grade = "B+";
        } else if (percentage >= 60) {
            grade = "B";
        } else if (percentage >= 50) {
            grade = "C+";
        } else if (percentage >= 40) {
            grade = "C";
        } else {
            grade = "F";
        }

        // =====================================
        // Preserve Rank Number
        // =====================================

        const rankValue =
            body.rank_no === undefined ||
            body.rank_no === null ||
            String(body.rank_no).trim() === ""
                ? null
                : Number(body.rank_no);

        const rankNo =
            Number.isFinite(rankValue)
                ? rankValue
                : null;

        const resultData = {
            application_id: applicationId,
            marks,
            percentage,
            grade,
            rank_no: rankNo,
            result_status: "Entered"
        };

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
                resultData
            );

        } else {

            await RtseResult.save(
                resultData
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

        console.error(
            "Save Result Error:",
            err
        );

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
