const RtseApplication =
require("../models/RtseApplication");

const RtseSetting =
require("../models/RtseSetting");

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

// =====================================
// RTSE Dashboard
// =====================================

// =====================================
// RTSE Dashboard
// =====================================

exports.dashboard = async (req, res) => {

    try {

        const applications =
            await RtseApplication.getAll();

console.log(applications[0]);

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

                applications,

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

                application

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

        res.render(

            "admin/rtse/edit-application",

            {

                title: "Edit Application",

                application

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
// Generate Roll Numbers
// =====================================

// =====================================
// Generate Roll Numbers
// =====================================

exports.generateRollNumbers = async (req, res) => {

    try {

        const section = req.params.section;

        const totalGenerated =
            await RtseApplication.generateRollNumbers(
                section
            );

        req.flash(

            "success",

            `${totalGenerated} Roll Numbers generated successfully for Section ${section}.`

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

    console.log(">>> Generate Admit Cards POST received for section:", req.params.section);

    try {

        await RtseApplication.generateAdmitCards(req.params.section);

        req.flash(
            "success",
            "Admit Cards generated successfully."
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

        const students =
            await RtseApplication.getApprovedSectionStudents(
                section
            );

        res.render(
            "admin/rtse/approved-students",
            {
                title:
                    `Approved Students - Section ${section}`,

                section,

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

        const section = req.params.section;

        const students =
            await RtseApplication.getAdmitCardStudents(
                section
            );

        if (!students.length) {

            req.flash(

                "error",

                "No students found for admit card generation."

            );

            return res.redirect("/admin/rtse");

        }

        res.render(

            "admin/rtse/admit-generation",

            {

                title: "Generate Admit Cards",

                section,

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

        res.render(

            "admin/rtse/admit-card",

            {

                title: "RTSE Admit Card",

                setting,

                student,

                examYear:
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




const RtseExamSetting =
require("../models/RtseExamSetting");


// =====================================
// Examination Control Centre
// =====================================

exports.examSettingPage = async (req, res) => {

    try {

        const setting =
            await RtseExamSetting.get();

        res.render(

            "admin/rtse/exam-settings",

            {

                title:
                    "RTSE Examination Settings",

                setting

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to load examination settings."

        );

        res.redirect("/admin/rtse");

    }

};


// =====================================
// Save Examination Settings
// =====================================

exports.saveExamSettings = async (req, res) => {

    try{

        await RtseExamSetting.save(req.body);

        req.flash(

            "success",

            "Examination settings updated successfully."

        );

        res.redirect("/admin/rtse/exam-settings");

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to save examination settings."

        );

        res.redirect("/admin/rtse/exam-settings");

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

        await RtseSeatPlan.generate(

            req.body.section,

            parseInt(req.body.room_capacity)

        );

        req.flash(

            "success",

            "Seat Plan generated successfully."

        );

        res.redirect("/admin/rtse/seat-plan");

    }

    catch(err){

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

exports.roomWiseSeatPlan = async (req,res)=>{

    try{

        const rooms=

        await RtseSeatPlan.getRoomWise(

            req.params.section

        );

        res.render(

            "admin/rtse/room-seat-plan",

            {

                title:"Room Wise Seat Plan",

                section:req.params.section,

                rooms

            }

        );

    }

    catch(err){

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

        const rooms =
            await RtseSeatPlan.getRoomWise(
                req.params.section
            );

        const examSetting =
            await RtseExamSetting.get();

        res.render(

            "admin/rtse/attendance-sheet",

            {

                title: "Invigilator Attendance Sheet",

                section: req.params.section,

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
// Result Dashboard
// =====================================

exports.resultDashboard = async (req, res) => {

    try {

        const students =
            await RtseApplication.getAll();

        const setting =
            await RtseSetting.get();

        res.render(

            "admin/rtse/result-dashboard",

            {

                title: "RTSE Result Dashboard",

                students,

                setting

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load Result Dashboard."

        );

        return res.redirect("/admin/rtse");

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

        const old =
            await RtseResult.getByApplication(
                req.params.id
            );

        if(old){

            await RtseResult.update(

                req.params.id,

                req.body

            );

        }

        else{

            req.body.application_id =
                req.params.id;

            await RtseResult.save(

                req.body

            );

        }

        req.flash(

            "success",

            "Result saved successfully."

        );

        res.redirect("/admin/rtse/results");

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to save result."

        );

        res.redirect("/admin/rtse/results");

    }

};



// =====================================
// Generate Rankings
// =====================================

exports.generateRankings = async (req, res) => {

    try {

        const sections = [

            "A",

            "B",

            "C",

            "D",

            "E"

        ];

        for (const section of sections) {

            await RtseResult.generateSectionRanks(

                section

            );

        }

        await RtseResult.generateOverallRank();

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

        const students=

        await RtseResult.getOverallMeritList();

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

        const students=

        await RtseResult.getSectionMeritList(

            req.params.section

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

        const students =

        await RtseCertificate.getPendingStudents(

            req.params.section || null

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

        const certificates=

        await RtseCertificate.getBySection(

            req.params.section

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

        const certificates =
            await RtseCertificate.getAll();

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
