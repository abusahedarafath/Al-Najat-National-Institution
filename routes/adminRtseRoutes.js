const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const adminRtseController =
require("../controllers/adminRtseController");


// =====================================
// RTSE Dashboard
// =====================================

router.get(

    "/rtse",

    auth.isLoggedIn,

    adminRtseController.dashboard

);


// =====================================
// Application Profile
// =====================================

router.get(

    "/rtse/application/:id",

    auth.isLoggedIn,

    adminRtseController.applicationDetails

);


// =====================================
// Approve Application
// =====================================

router.get(

    "/rtse/application/:id/approve",

    auth.isLoggedIn,

    adminRtseController.approveApplication

);


// =====================================
// Reject Application
// =====================================

router.get(

    "/rtse/application/:id/reject",

    auth.isLoggedIn,

    adminRtseController.rejectApplication

);


// =====================================
// Edit Application
// =====================================

router.get(

    "/rtse/application/:id/edit",

    auth.isLoggedIn,

    adminRtseController.editApplicationPage

);

router.post(

    "/rtse/application/:id/edit",

    auth.isLoggedIn,

    adminRtseController.updateApplication

);


// =====================================
// Archive Application
// =====================================

router.post(

    "/rtse/application/:id/archive",

    auth.isLoggedIn,

    adminRtseController.archiveApplication

);


// =====================================
// Archive List
// =====================================

router.get(

    "/rtse/archive",

    auth.isLoggedIn,

    adminRtseController.archive

);


// =====================================
// Restore Application
// =====================================

router.post(

    "/rtse/application/:id/restore",

    auth.isLoggedIn,

    adminRtseController.restoreApplication

);

// =====================================
// Generate Roll Numbers
// =====================================

router.get(

    "/rtse/generate-roll/:section",

    auth.isLoggedIn,

    adminRtseController.generateRollNumbers

);


// =====================================
// Generate Admit Cards
// =====================================

router.get(

    "/rtse/generate-admit/:section",

    auth.isLoggedIn,

    adminRtseController.generateAdmitCards

);


// =====================================
// Export All Applications
// =====================================

router.get(

    "/rtse/export",

    auth.isLoggedIn,

    adminRtseController.exportExcel

);


// =====================================
// Export Section Wise
// =====================================

router.get(

    "/rtse/export/:section",

    auth.isLoggedIn,

    adminRtseController.exportSectionExcel

);


// =====================================
// Generate Roll Numbers
// =====================================

router.get(

    "/rtse/generate-roll/:section",

    auth.isLoggedIn,

    adminRtseController.generateRollNumbers

);


// =====================================
// Generate Admit Cards
// =====================================

router.get(

    "/rtse/generate-admit/:section",

    auth.isLoggedIn,

    adminRtseController.generateAdmitCards

);


// =====================================
// Export All Applications
// =====================================

router.get(

    "/rtse/export",

    auth.isLoggedIn,

    adminRtseController.exportExcel

);


// =====================================
// Export Section Wise Excel
// =====================================

router.get(

    "/rtse/export/:section",

    auth.isLoggedIn,

    adminRtseController.exportSectionExcel

);




// =====================================
// Admit Card Generator
// =====================================

router.get(

    "/rtse/admit-generator/:section",

    auth.isLoggedIn,

    adminRtseController.admitGenerationPage

);


router.post(
    "/rtse/admit-generator/:section",
    auth.isLoggedIn,
    adminRtseController.generateAdmitCards
);

// =====================================
// View Admit Card
// =====================================

router.get(

    "/rtse/application/:id/admit-card",

    auth.isLoggedIn,

    adminRtseController.viewAdmitCard

);


// =====================================
// Open Applications
// =====================================

router.get(

    "/rtse/open-applications",

    auth.isLoggedIn,

    adminRtseController.openApplications

);


// =====================================
// Close Applications
// =====================================

router.get(

    "/rtse/close-applications",

    auth.isLoggedIn,

    adminRtseController.closeApplications

);



// =====================================
// Publish Admit Cards
// =====================================

router.get(

    "/rtse/publish-admit",

    auth.isLoggedIn,

    adminRtseController.publishAdmitCards

);


// =====================================
// Hide Admit Cards
// =====================================

router.get(

    "/rtse/hide-admit",

    auth.isLoggedIn,

    adminRtseController.hideAdmitCards

);


// =====================================
// Examination Settings
// =====================================

router.get(

    "/rtse/exam-settings",

    auth.isLoggedIn,

    adminRtseController.examSettingPage

);

router.post(

    "/rtse/exam-settings",

    auth.isLoggedIn,

    adminRtseController.saveExamSettings

);

// =====================================
// Seat Plan
// =====================================

router.get(

    "/rtse/seat-plan",

    auth.isLoggedIn,

    adminRtseController.seatPlanPage

);

router.post(

    "/rtse/seat-plan",

    auth.isLoggedIn,

    adminRtseController.generateSeatPlan

);

// =====================================
// Room Wise Seat Plan
// =====================================

router.get(

    "/rtse/seat-plan/:section",

    auth.isLoggedIn,

    adminRtseController.roomWiseSeatPlan

);





// =====================================
// Invigilator Attendance Sheet
// =====================================

router.get(

    "/rtse/attendance-sheet/:section",

    auth.isLoggedIn,

    adminRtseController.attendanceSheet

);


// =====================================
// Result Management
// =====================================

router.get(

    "/rtse/results",

    auth.isLoggedIn,

    adminRtseController.resultDashboard

);

router.get(

    "/rtse/result/:id",

    auth.isLoggedIn,

    adminRtseController.resultEntryPage

);

router.post(

    "/rtse/result/:id",

    auth.isLoggedIn,

    adminRtseController.saveResult

);


// =====================================
// Generate Rankings
// =====================================

router.get(

    "/rtse/results/generate-rankings",

    auth.isLoggedIn,

    adminRtseController.generateRankings

);


// =====================================
// Merit Lists
// =====================================

router.get(

    "/rtse/results/merit-list",

    auth.isLoggedIn,

    adminRtseController.overallMeritList

);

router.get(

    "/rtse/results/merit-list/:section",

    auth.isLoggedIn,

    adminRtseController.sectionMeritList

);

// =====================================
// Result Publishing
// =====================================

router.get(

    "/rtse/results/publish",

    auth.isLoggedIn,

    adminRtseController.publishResults

);

router.get(

    "/rtse/results/hide",

    auth.isLoggedIn,

    adminRtseController.hideResults

);




// =====================================
// Certificate Generator
// =====================================

router.get(

    "/rtse/certificate/:id/generate",

    auth.isLoggedIn,

    adminRtseController.generateCertificate

);

// =====================================
// View Certificate
// =====================================

router.get(

    "/rtse/certificate/:id",

    auth.isLoggedIn,

    adminRtseController.viewCertificate

);



// =====================================
// Certificate Publish / Hide
// =====================================

router.get(

    "/rtse/certificates/publish",

    auth.isLoggedIn,

    adminRtseController.publishCertificates

);

router.get(

    "/rtse/certificates/hide",

    auth.isLoggedIn,

    adminRtseController.hideCertificates

);


// =====================================
// Bulk Certificate Generation
// =====================================

router.get(

    "/rtse/certificates/generate-all",

    auth.isLoggedIn,

    adminRtseController.generateCertificates

);

router.get(

    "/rtse/certificates/generate/:section",

    auth.isLoggedIn,

    adminRtseController.generateCertificates

);



// =====================================
// Section Certificates
// =====================================

router.get(

    "/rtse/certificates/section/:section",

    auth.isLoggedIn,

    adminRtseController.sectionCertificates

);


// =====================================
// All Certificates
// =====================================

router.get(

    "/rtse/certificates/all",

    auth.isLoggedIn,

    adminRtseController.allCertificates

);


module.exports = router;
