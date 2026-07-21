const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

const adminDashboardController = require("../controllers/adminDashboardController");
const applicationAdminController = require("../controllers/applicationAdminController");
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
    adminController.showStudents
);

router.get(
    "/admin/student/:id",
    authMiddleware.isLoggedIn,
    adminController.viewStudent
);

router.get(
    "/admin/student/:id/edit",
    authMiddleware.isLoggedIn,
    adminController.editStudentPage
);

router.post(
    "/admin/student/:id/edit",
    authMiddleware.isLoggedIn,
    upload.single("photo"),
    adminController.updateStudent
);

router.post(
    "/admin/student/:id/deactivate",
    authMiddleware.isLoggedIn,
    adminController.deactivateStudent
);

module.exports = router;
