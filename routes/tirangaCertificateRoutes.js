const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/tirangaCertificateController");

router.get(
    "/tiranga-certificate",
    controller.form
);

router.post(
    "/tiranga-certificate/generate",
    controller.generate
);

// High-quality PDF download
router.get(
    "/tiranga-certificate/pdf/:certificateNo",
    controller.generatePdf
);

module.exports = router;
