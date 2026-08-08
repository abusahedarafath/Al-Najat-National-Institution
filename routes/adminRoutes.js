const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");


const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

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
const adminHomepageFeatureController = require("../controllers/adminHomepageFeatureController");
const adminHomepageAchievementController = require("../controllers/adminHomepageAchievementController");

// ===============================
// Dashboard
// ===============================

router.get(
    "/admin/honour-heart",
    (req, res) => {
        res.redirect("/admin/honour-heart/legends");
    }
);

router.get(
    "/admin",
    adminDashboardController.dashboard
);

router.get(
    "/admin/dashboard",
    adminDashboardController.dashboard
);

// ===============================
// Applications
// ===============================

router.get(
    "/admin/applications",
    applicationAdminController.showApplications
);

router.get(
    "/admin/application/:id",
    applicationAdminController.viewApplication
);

router.get(
    "/admin/application/:id/edit",
    applicationAdminController.editApplication
);

router.post(
    "/admin/application/:id/approve",
    adminController.approveApplication
);

// ===============================
// Students
// ===============================

router.get(
    "/admin/students",
    studentAdminController.showStudents
);

router.get(
    "/admin/student/:id",
    studentController.viewStudent
);

router.get(
    "/admin/student/:id/edit",
    studentController.editStudentPage
);

router.post(
    "/admin/student/:id/edit",
    upload.single("photo"),
    studentController.updateStudent
);

router.post(
    "/admin/student/:id/deactivate",
    studentController.deactivateStudent
);

// ===============================
// Hero Sliders
// ===============================

router.get(
    "/admin/sliders",
    adminHeroSliderController.index
);

router.get(
    "/admin/sliders/create",
    adminHeroSliderController.createPage
);

router.post(
    "/admin/sliders/create",
    sliderUpload.single("image"),
    adminHeroSliderController.store
);

router.get(
    "/admin/sliders/:id/edit",
    adminHeroSliderController.editPage
);

router.post(
    "/admin/sliders/:id/edit",
    sliderUpload.single("image"),
    adminHeroSliderController.update
);

router.post(
    "/admin/sliders/:id/delete",
    adminHeroSliderController.delete
);

router.post(
    "/admin/sliders/:id/toggle",
    adminHeroSliderController.toggleStatus
);

// ===============================
// Website Management
// ===============================

router.get(
    "/admin/website",
    websiteController.dashboard
);

// ===============================
// Delete Application
// ===============================

router.post(
    "/admin/application/:id/delete",
    applicationAdminController.deleteApplication
);

// ===============================
// Delete Student
// ===============================

router.post(
    "/admin/student/:id/delete",
    studentAdminController.deleteStudent
);

// =====================================
// Homepage - Why Choose Us
// =====================================

router.get(
    "/admin/homepage/features",
    auth.isLoggedIn,
    adminHomepageFeatureController.index
);

router.get(
    "/admin/homepage/features/create",
    auth.isLoggedIn,
    adminHomepageFeatureController.createPage
);

router.post(
    "/admin/homepage/features/create",
    auth.isLoggedIn,
    adminHomepageFeatureController.create
);

router.get(
    "/admin/homepage/features/:id/edit",
    auth.isLoggedIn,
    adminHomepageFeatureController.editPage
);

router.post(
    "/admin/homepage/features/:id/edit",
    auth.isLoggedIn,
    adminHomepageFeatureController.update
);

router.post(
    "/admin/homepage/features/:id/delete",
    auth.isLoggedIn,
    adminHomepageFeatureController.delete
);


// =====================================
// Homepage - Our Achievements
// =====================================

router.get(
    "/admin/homepage/achievements",
    auth.isLoggedIn,
    adminHomepageAchievementController.index
);

router.get(
    "/admin/homepage/achievements/create",
    auth.isLoggedIn,
    adminHomepageAchievementController.createPage
);

router.post(
    "/admin/homepage/achievements/create",
    auth.isLoggedIn,
    adminHomepageAchievementController.create
);

router.get(
    "/admin/homepage/achievements/:id/edit",
    auth.isLoggedIn,
    adminHomepageAchievementController.editPage
);

router.post(
    "/admin/homepage/achievements/:id/edit",
    auth.isLoggedIn,
    adminHomepageAchievementController.update
);

router.post(
    "/admin/homepage/achievements/:id/delete",
    auth.isLoggedIn,
    adminHomepageAchievementController.delete
);


module.exports = router;
