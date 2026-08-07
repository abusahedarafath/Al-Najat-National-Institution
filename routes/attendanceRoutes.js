const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const attendanceController = require("../controllers/attendanceController");

// ======================================
// Attendance Routes
// ======================================

// All Attendance Records
router.get(
    "/attendance",
    attendanceController.showAttendance
);

// Add Attendance
router.get(
    "/attendance/add",
    attendanceController.addAttendancePage
);

router.post(
    "/attendance/add",
    attendanceController.createAttendance
);

// Attendance Details
router.get(
    "/attendance/:id",
    attendanceController.viewAttendance
);

// Edit Attendance
router.get(
    "/attendance/:id/edit",
    attendanceController.editAttendancePage
);

router.post(
    "/attendance/:id/edit",
    attendanceController.updateAttendance
);

// Delete Attendance
router.post(
    "/attendance/:id/delete",
    attendanceController.deleteAttendance
);

module.exports = router;
