const express = require("express");
const router = express.Router();

const studentAuthController = require("../controllers/studentAuthController");
const studentDashboardController = require("../controllers/studentDashboardController");
const studentAuth = require("../middleware/studentAuth");

router.get("/student/login", studentAuthController.showLogin);

router.post("/student/login", studentAuthController.login);

router.get(
    "/student/dashboard",
    studentAuth.isStudentLoggedIn,
    studentDashboardController.dashboard
);

router.get("/student/logout", studentAuthController.logout);

module.exports = router;
