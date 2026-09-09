"use strict";

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/adminRtseLoginInformationPdfController");
const settingsController = require("../controllers/rtseLoginInformationPdfSettingsController");


router.get(
    "/rtse/login-information-pdf-settings",
    auth.isAdmin,
    settingsController.page
);

router.post(
    "/rtse/login-information-pdf-settings",
    auth.isAdmin,
    settingsController.update
);

router.get(
    "/rtse/login-information-pdf/status/:section",
    auth.isAdmin,
    controller.statusSection
);

router.post(
    "/rtse/login-information-pdf/prepare/:section",
    auth.isAdmin,
    controller.prepareSection
);

router.get(
    "/rtse/login-information-pdf/view/:section",
    auth.isAdmin,
    controller.viewSection
);

router.get(
    "/rtse/login-information-pdf/file/:id",
    auth.isAdmin,
    controller.file
);

router.post(
    "/rtse/login-information-pdf/reset/:section",
    auth.isAdmin,
    controller.resetSection
);

module.exports = router;
