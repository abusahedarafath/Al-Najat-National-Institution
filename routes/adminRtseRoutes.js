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

    auth.isAdmin,

    adminRtseController.dashboard

);

// =====================================
// RTSE Live Application Search
router.get(
    "/rtse/applications/live-search",
    adminRtseController.liveApplicationSearch
);

// RTSE Student Applications
// =====================================

router.get(

    "/rtse/applications",

    auth.isAdmin,

    adminRtseController.applicationsPage

);


// =====================================
// Application Profile
// =====================================

router.get(

    "/rtse/application/:id",

    auth.isAdmin,

    adminRtseController.applicationDetails

);


// =====================================
// Approve Application
// =====================================

router.get(

    "/rtse/application/:id/approve",

    auth.isAdmin,

    adminRtseController.approveApplication

);


// =====================================
// Reject Application
// =====================================

router.get(

    "/rtse/application/:id/reject",

    auth.isAdmin,

    adminRtseController.rejectApplication

);


// =====================================
// Edit Application
// =====================================

router.get(

    "/rtse/application/:id/edit",

    auth.isAdmin,

    adminRtseController.editApplicationPage

);

router.post(

    "/rtse/application/:id/edit",

    auth.isAdmin,

    adminRtseController.updateApplication

);


// =====================================
// Archive Application
// =====================================

router.post(

    "/rtse/application/:id/archive",

    auth.isAdmin,

    adminRtseController.archiveApplication

);


// =====================================
// Archive List
// =====================================

router.get(

    "/rtse/archive",

    auth.isAdmin,

    adminRtseController.archive

);


// =====================================
// Restore Application
// =====================================

router.post(

    "/rtse/application/:id/restore",

    auth.isAdmin,

    adminRtseController.restoreApplication

);



// =====================================
// Permanently Delete Application
// =====================================

router.post(
    "/rtse/application/:id/delete",
    auth.isAdmin,
    adminRtseController.permanentlyDeleteApplication
);

// =====================================
// Reset Roll Numbers + Admit Cards
// Section Wise
// =====================================

router.post(
    "/rtse/reset-roll/:section",
    auth.isAdmin,
    adminRtseController.resetRollNumbers
);


// =====================================
// Generate Roll Numbers
// =====================================

router.get(

    "/rtse/generate-roll/:section",

    auth.isAdmin,

    adminRtseController.generateRollNumbers

);


// =====================================
// Generate Admit Cards
// =====================================

router.get(

    "/rtse/generate-admit/:section",

    auth.isAdmin,

    adminRtseController.generateAdmitCards

);


// =====================================
// Export All Applications
// =====================================

router.get(

    "/rtse/export",

    auth.isAdmin,

    adminRtseController.exportExcel

);


// =====================================
// Export Section Wise
// =====================================

router.get(
    "/rtse/export/approved",
    auth.isAdmin,
    adminRtseController.exportApprovedExcel
);

// =====================================
// Export Section Wise
// =====================================
router.get(

    "/rtse/export/:section",

    auth.isAdmin,

    adminRtseController.exportSectionExcel

);
















// =====================================
// Live Search Approved Students - Section Wise
// =====================================

router.get(
    "/rtse/approved/:section/live-search",
    auth.isAdmin,
    adminRtseController.liveApprovedSectionSearch
);


// =====================================
// Manage Approved Students
// =====================================

router.get(
    "/rtse/approved/:section",
    auth.isAdmin,
    adminRtseController.approvedStudents
);


// =====================================
// Make Approved Student Pending
// =====================================

router.post(
    "/rtse/approved/:section/:id/pending",
    auth.isAdmin,
    adminRtseController.makeApprovedStudentPending
);


// =====================================
// Remove Approved Student
// =====================================

router.post(
    "/rtse/approved/:section/:id/remove",
    auth.isAdmin,
    adminRtseController.removeApprovedStudent
);


// =====================================
// Admit Card Generator
// =====================================

router.get(

    "/rtse/admit-generator/:section",

    auth.isAdmin,

    adminRtseController.admitGenerationPage

);


router.post(
    "/rtse/admit-generator/:section",
    auth.isAdmin,
    adminRtseController.generateAdmitCards
);

// =====================================
// View Admit Card
// =====================================

router.get(

    "/rtse/application/:id/admit-card",

    auth.isAdmin,

    adminRtseController.viewAdmitCard

);


// =====================================
// Open Applications
// =====================================

router.get(

    "/rtse/open-applications",

    auth.isAdmin,

    adminRtseController.openApplications

);


// =====================================
// Close Applications
// =====================================

router.get(

    "/rtse/close-applications",

    auth.isAdmin,

    adminRtseController.closeApplications

);



// =====================================
// Publish Admit Cards
// =====================================

router.get(

    "/rtse/publish-admit",

    auth.isAdmin,

    adminRtseController.publishAdmitCards

);


// =====================================
// Hide Admit Cards
// =====================================

router.get(

    "/rtse/hide-admit",

    auth.isAdmin,

    adminRtseController.hideAdmitCards

);


// =====================================
// Examination Settings
// =====================================

router.get(

    "/rtse/exam-settings",

    auth.isAdmin,

    adminRtseController.examSettingPage

);

router.post(

    "/rtse/exam-settings",

    auth.isAdmin,

    adminRtseController.saveExamSettings

);

// =====================================
// Seat Plan
// =====================================

router.get(

    "/rtse/seat-plan",

    auth.isAdmin,

    adminRtseController.seatPlanPage

);

router.post(

    "/rtse/seat-plan",

    auth.isAdmin,

    adminRtseController.generateSeatPlan

);

// =====================================
// Room Wise Seat Plan
// =====================================

router.get(

    "/rtse/seat-plan/:section",

    auth.isAdmin,

    adminRtseController.roomWiseSeatPlan

);





// =====================================
// Invigilator Attendance Sheet
// =====================================

router.get(

    "/rtse/attendance-sheet/:section",

    auth.isAdmin,

    adminRtseController.attendanceSheet

);


// =====================================
// Attendance Management
// =====================================

router.post(
    "/rtse/attendance/absent/:id",
    auth.isAdmin,
    adminRtseController.markAttendanceAbsent
);


// =====================================
// Result Management
// =====================================

router.get(

    "/rtse/results",

    auth.isAdmin,

    adminRtseController.resultDashboard

);

router.get(

    "/rtse/result/:id",

    auth.isAdmin,

    adminRtseController.resultEntryPage

);


// =====================================
// Reset Result to Pending
// =====================================

router.post(
    "/rtse/result/:id/reset-pending",
    auth.isAdmin,
    adminRtseController.resetResultPending
);


router.post(

    "/rtse/result/:id",

    auth.isAdmin,

    adminRtseController.saveResult

);


// =====================================
// Generate Rankings
// =====================================

router.get(

    "/rtse/results/generate-rankings",

    auth.isAdmin,

    adminRtseController.generateRankings

);


// =====================================
// Merit Lists
// =====================================

router.get(

    "/rtse/results/merit-list",

    auth.isAdmin,

    adminRtseController.overallMeritList

);

router.get(

    "/rtse/results/merit-list/:section",

    auth.isAdmin,

    adminRtseController.sectionMeritList

);

// =====================================
// Result Publishing
// =====================================

router.get(

    "/rtse/results/publish",

    auth.isAdmin,

    adminRtseController.publishResults

);

router.get(

    "/rtse/results/hide",

    auth.isAdmin,

    adminRtseController.hideResults

);




// =====================================
// Certificate Generator
// =====================================

router.get(

    "/rtse/certificate/:id/generate",

    auth.isAdmin,

    adminRtseController.generateCertificate

);

// =====================================
// View Certificate
// =====================================

router.get(

    "/rtse/certificate/:id",

    auth.isAdmin,

    adminRtseController.viewCertificate

);



// =====================================
// Certificate Publish / Hide
// =====================================

router.get(

    "/rtse/certificates/publish",

    auth.isAdmin,

    adminRtseController.publishCertificates

);

router.get(

    "/rtse/certificates/hide",

    auth.isAdmin,

    adminRtseController.hideCertificates

);


// =====================================
// Bulk Certificate Generation
// =====================================

router.get(

    "/rtse/certificates/generate-all",

    auth.isAdmin,

    adminRtseController.generateCertificates

);

router.get(

    "/rtse/certificates/generate/:section",

    auth.isAdmin,

    adminRtseController.generateCertificates

);



// =====================================
// Section Certificates
// =====================================

router.get(

    "/rtse/certificates/section/:section",

    auth.isAdmin,

    adminRtseController.sectionCertificates

);


// =====================================
// All Certificates
// =====================================

router.get(

    "/rtse/certificates/all",

    auth.isAdmin,

    adminRtseController.allCertificates

);


module.exports = router;
