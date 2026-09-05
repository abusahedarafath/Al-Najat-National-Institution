const express = require("express");
const multer = require("multer");
const router = express.Router();

const seatDesignerBody = multer().none();
const roomFormBody = multer().none();

const rtseAdminPhotoUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedMime = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowedMime.includes(file.mimetype)) {
            return cb(null, true);
        }

        return cb(
            new Error("Only JPG, JPEG, PNG and WEBP images are allowed.")
        );
    }
});

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
    rtseAdminPhotoUpload.single("photo"),
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

// =====================================
// RTSE Examination Control Centre
// =====================================

// Examination List
router.get(

    "/rtse/exam-settings",

    auth.isAdmin,

    adminRtseController.examSettingPage

);


// Create Examination Page
router.get(

    "/rtse/exam-settings/new",

    auth.isAdmin,

    adminRtseController.newExamSettingPage

);


// Create Examination
router.post(

    "/rtse/exam-settings/new",

    auth.isAdmin,

    multer().none(),
    adminRtseController.createExamSetting

);


// View Examination
router.get(

    "/rtse/exam-settings/:id",

    auth.isAdmin,

    adminRtseController.viewExamSetting

);


// Edit Examination
router.get(

    "/rtse/exam-settings/:id/edit",

    auth.isAdmin,

    adminRtseController.editExamSettingPage

);


// Update Examination
router.post(

    "/rtse/exam-settings/:id/edit",

    auth.isAdmin,

    multer().none(),
    adminRtseController.updateExamSetting

);


// Activate Examination
router.post(

    "/rtse/exam-settings/:id/activate",

    auth.isAdmin,

    adminRtseController.activateExamSetting

);


// Deactivate Examination
router.post(

    "/rtse/exam-settings/:id/deactivate",

    auth.isAdmin,

    adminRtseController.deactivateExamSetting

);


// Delete Examination
router.post(

    "/rtse/exam-settings/:id/delete",

    auth.isAdmin,

    adminRtseController.deleteExamSetting

);

// =====================================
// =====================================
// Seat Plan
// =====================================

router.get(
    "/rtse/seat-plan",
    auth.isAdmin,
    adminRtseController.seatPlanPage
);

router.post(
    "/rtse/seat-plan/shifts",
    auth.isAdmin,
    express.urlencoded({ extended: true }),
    adminRtseController.addSeatPlanShift
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/edit",
    auth.isAdmin,
    express.urlencoded({ extended: true }),
    adminRtseController.editSeatPlanShift
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/remove",
    auth.isAdmin,
    express.urlencoded({ extended: true }),
    adminRtseController.removeSeatPlanShift
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/toggle",
    auth.isAdmin,
    express.urlencoded({ extended: true }),
    adminRtseController.toggleSeatPlanShift
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/rooms",
    auth.isAdmin,
    express.urlencoded({ extended: true }),
    (req, res, next) => {
        console.log("=== ADD ROOM BODY DEBUG ===");
        console.log("content-type:", req.headers["content-type"]);
        console.log("body:", req.body);
        console.log("raw room_no:", req.body?.room_no);
        next();
    },
    adminRtseController.addSeatPlanRoom
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/rooms/:roomId/edit",
    auth.isAdmin,
    express.urlencoded({ extended: true }),
    adminRtseController.editSeatPlanRoom
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/rooms/:roomId/remove",
    auth.isAdmin,
    express.urlencoded({ extended: true }),
    adminRtseController.removeSeatPlanRoom
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/rooms/:roomId/toggle",
    auth.isAdmin,
    express.urlencoded({ extended: true }),
    adminRtseController.toggleSeatPlanRoom
);



// =====================================
// Seat Designer
// =====================================

router.get(
    "/rtse/seat-plan/shifts/:shiftId/rooms/:roomId/seats",
    auth.isAdmin,
    adminRtseController.seatDesignerPage
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/rooms/:roomId/seats/generate",
    auth.isAdmin,
    seatDesignerBody,
    adminRtseController.generateSeatDesigner
);


router.post(
    "/rtse/seat-plan/shifts/:shiftId/rooms/:roomId/lock",
    auth.isAdmin,
    seatDesignerBody,
    adminRtseController.lockRoomSeatsAndGenerateTokens
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/rooms/:roomId/side-lock",
    auth.isAdmin,
    seatDesignerBody,
    adminRtseController.updateSeatSideLocks
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/rooms/:roomId/seat-system",
    auth.isAdmin,
    seatDesignerBody,
    adminRtseController.updateRoomSeatSystem
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/rooms/:roomId/seats/:seatId/update",
    auth.isAdmin,
    seatDesignerBody,
    adminRtseController.updateSeatDesignerSeat
);

router.post(
    "/rtse/seat-plan/shifts/:shiftId/rooms/:roomId/seats/clear",
    auth.isAdmin,
    seatDesignerBody,
    adminRtseController.clearSeatDesigner
);

router.post(
    "/rtse/seat-plan",
    auth.isAdmin,
    adminRtseController.generateSeatPlan
);

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
    "/rtse/attendance/reset/:id",
    auth.isAdmin,
    adminRtseController.resetAttendanceStatus
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
