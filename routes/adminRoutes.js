const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");




router.get(
    "/admin",
    authMiddleware.isLoggedIn,
    adminController.dashboard
);


router.get(
    "/admin/dashboard",
    authMiddleware.isLoggedIn,
    adminController.dashboard
);

router.get(
    "/admin/applications",
    authMiddleware.isLoggedIn,
    adminController.showApplications
);


router.get(
    "/admin/application/:id",
    authMiddleware.isLoggedIn,
    adminController.viewApplication
);


router.post(
    "/admin/application/:id/approve",
    authMiddleware.isLoggedIn,
    adminController.approveApplication
);

router.get(
    "/admin/students",
    authMiddleware.isLoggedIn,
    (req, res, next) => {
        console.log("✅ /admin/students route reached");
        next();
    },
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
