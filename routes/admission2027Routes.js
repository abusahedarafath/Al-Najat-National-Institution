const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadApplication");
const applicationController = require("../controllers/applicationController");

// =========================
// Admission Pages
// =========================

router.get("/admission2027", (req, res) => {
    res.render("admission2027/index");
});

router.get("/admission2027/arabic-awal", (req, res) => {
    res.render("admission2027/arabic-awal");
});

// =========================
// Admission Wizard
// =========================

router.get("/admission2027/wizard", (req, res) => {
    res.render("admission2027/wizard");
});

// =========================
// Submit Application
// =========================

router.post(
    "/admission2027/apply",

    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "signature", maxCount: 1 },
        { name: "birth_certificate", maxCount: 1 },
        { name: "tc", maxCount: 1 },
        { name: "marksheet", maxCount: 1 },
        { name: "aadhaar", maxCount: 1 }
    ]),

    applicationController.submitApplication
);

module.exports = router;
