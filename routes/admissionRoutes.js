const express = require("express");

const router = express.Router();

const admissionController = require("../controllers/admissionController");

router.get("/admission", admissionController.showAdmissionPage);

router.get("/apply", admissionController.showApplyPage);

router.post("/apply", admissionController.submitApplication);

module.exports = router;
