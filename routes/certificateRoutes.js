const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const certificateController = require("../controllers/certificateController");

// ======================================
// Certificate Routes
// ======================================

// All Certificates
router.get(
    "/certificates",
    certificateController.showCertificates
);

// Generate Certificate
router.get(
    "/certificate/add",
    certificateController.addCertificatePage
);

router.post(
    "/certificate/add",
    certificateController.createCertificate
);

// View Certificate
router.get(
    "/certificate/:id",
    certificateController.viewCertificate
);

// Edit Certificate
router.get(
    "/certificate/:id/edit",
    certificateController.editCertificatePage
);

router.post(
    "/certificate/:id/edit",
    certificateController.updateCertificate
);

// Delete Certificate
router.post(
    "/certificate/:id/delete",
    certificateController.deleteCertificate
);

module.exports = router;
