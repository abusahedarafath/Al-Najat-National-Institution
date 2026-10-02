const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const websiteVisitorController =
    require("../controllers/websiteVisitorController");

router.post(
    "/visitor/heartbeat",
    websiteVisitorController.heartbeat
);

router.post(
    "/visitor/live-status",
    websiteVisitorController.setLiveStatus
);

router.get(
    "/admin/visitor-statistics",
    auth.isAdmin,
    websiteVisitorController.statistics
);

module.exports = router;
