const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const createUploader = require("../middleware/uploadFactory");
const sliderUpload = createUploader("sliders");

const adminDashboardController = require("../controllers/adminDashboardController");
const applicationAdminController = require("../controllers/applicationAdminController");
const studentController = require("../controllers/studentController");
const adminController = require("../controllers/adminController");
const studentAdminController = require("../controllers/studentAdminController");
const adminHeroSliderController = require("../controllers/adminHeroSliderController");
const websiteController = require("../controllers/websiteController");

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
    studentAdminController.showStudents
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

// ===============================
// Hero Sliders
// ===============================
// ===============================
// Hero Sliders
// ===============================

// List All Sliders
router.get(
    "/admin/sliders",
    authMiddleware.isLoggedIn,
    adminHeroSliderController.index
);

// Add Slider
router.get(
    "/admin/sliders/create",
    authMiddleware.isLoggedIn,
    adminHeroSliderController.createPage
);

router.post(
    "/admin/sliders/create",
    authMiddleware.isLoggedIn,
    sliderUpload.single("image"),
    adminHeroSliderController.store
);

// Edit Slider
router.get(
    "/admin/sliders/:id/edit",
    authMiddleware.isLoggedIn,
    adminHeroSliderController.editPage
);

router.post(
    "/admin/sliders/:id/edit",
    authMiddleware.isLoggedIn,
    upload.single("image"),
    adminHeroSliderController.update
);

// Delete Slider
router.post(
    "/admin/sliders/:id/delete",
    authMiddleware.isLoggedIn,
    adminHeroSliderController.delete
);

// Toggle Status
router.post(
    "/admin/sliders/:id/toggle",
    authMiddleware.isLoggedIn,
    adminHeroSliderController.toggleStatus
);
// ===============================
// Website Management
// ===============================
router.get(
    "/admin/website",
    authMiddleware.isLoggedIn,
    websiteController.dashboard
);

router.post(
    "/admin/sliders/:id/edit",
    authMiddleware.isLoggedIn,
    sliderUpload.single("image"),
    adminHeroSliderController.update
);
module.exports = router;
