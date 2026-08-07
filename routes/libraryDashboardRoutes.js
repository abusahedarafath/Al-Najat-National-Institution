const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const libraryDashboardController = require("../controllers/libraryDashboardController");

// ======================================
// Library Dashboard Routes
// ======================================

// Dashboard
router.get(
    "/library-dashboard",
    libraryDashboardController.dashboard
);

module.exports = router;
