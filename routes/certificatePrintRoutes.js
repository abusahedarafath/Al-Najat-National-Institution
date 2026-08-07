const express = require("express");
const router = express.Router();

const certificatePrintController = require("../controllers/certificatePrintController");

// ======================================
// Certificate Print Route
// ======================================

// Print Certificate
router.get(
    "/certificate/:id/print",
    certificatePrintController.printCertificate
);

module.exports = router;
