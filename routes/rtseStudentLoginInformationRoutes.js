"use strict";

const express = require("express");
const router = express.Router();

const auth =
    require("../middleware/rtseStudentAuth");

const controller =
    require("../controllers/rtseStudentLoginInformationController");

router.get(
    "/student/login-information-pdf/status",
    auth.isLoggedIn,
    controller.status
);

router.post(
    "/student/login-information-pdf/prepare",
    auth.isLoggedIn,
    controller.prepare
);

router.get(
    "/student/login-information-pdf",
    auth.isLoggedIn,
    controller.view
);

router.get(
    "/student/login-information-pdf/file",
    auth.isLoggedIn,
    controller.file
);

router.get(
    "/student/login-information-pdf/download",
    auth.isLoggedIn,
    controller.download
);

router.post(
    "/student/login-information-pdf/reset",
    auth.isLoggedIn,
    controller.reset
);

module.exports = router;
