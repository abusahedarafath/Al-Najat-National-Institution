const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const superScannerController = require("../controllers/superScannerController");

// =====================================
// Super Scanner Dashboard
// =====================================

router.get(
    "/super-scanner",
    auth.isSuperScanner,
    superScannerController.dashboard
);


// =====================================
// QR Lookup
// =====================================

router.post(
    "/super-scanner/lookup",
    auth.isSuperScanner,
    superScannerController.lookup
);


// =====================================
// Mark Attendance
// =====================================

router.post(
    "/super-scanner/mark-present",
    auth.isSuperScanner,
    superScannerController.markPresent
);

module.exports = router;
