const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

const adminDashboardController = require("../controllers/adminDashboardController");
const applicationAdminController = require("../controllers/applicationAdminController");
const studentController = require("../controllers/studentController");
const adminController = require("../controllers/adminController");

// ===============================
// Dashboard
// ===============================
router.get(
    "/admin",
    authMiddleware.isLoggedIn,
    adminDashboardController.dashboard
);

router.get(
    "/admin/dashboard",
    authMiddleware.isLoggedIn,
    adminDashboardController.dashboard
);

// ===============================
// Applications
// ===============================
router.get(
    "/admin/applications",
    authMiddleware.isLoggedIn,
    applicationAdminController.showApplications
);

router.get(
    "/admin/application/:id",
    authMiddleware.isLoggedIn,
    applicationAdminController.viewApplication
);

router.post(
    "/admin/application/:id/approve",
    authMiddleware.isLoggedIn,
    adminController.approveApplication
);

// ===============================
// Students
// ===============================
router.get(
    "/admin/students",
    authMiddleware.isLoggedIn,
    studentController.showStudents
);

router.get(
    "/admin/student/:id",
    authMiddleware.isLoggedIn,
    studentController.viewStudent
);

router.get(
    "/admin/student/:id/edit",
    authMiddleware.isLoggedIn,
    studentController.editStudentPage
);

router.post(
    "/admin/student/:id/edit",
    authMiddleware.isLoggedIn,
    upload.single("photo"),
    studentController.updateStudent
);

router.post(
    "/admin/student/:id/deactivate",
    authMiddleware.isLoggedIn,
    studentController.deactivateStudent
);

module.exports = router;
