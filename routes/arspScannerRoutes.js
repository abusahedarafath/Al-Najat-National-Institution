const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/arspScannerController");

router.post(
    "/arsp/scanner/verify",
    express.json(),
    controller.verify
);

// Direct Tiranga certificate verification URL.
// This is also the URL encoded into the certificate QR.
router.get(
    "/arsp/tiranga/verify/:certificateNo",
    controller.tirangaVerifyPage
);

module.exports = router;
