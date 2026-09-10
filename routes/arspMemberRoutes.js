const express = require("express");

const router = express.Router();

const arspAuth = require("../middleware/arspAuth");

const arspMemberController =
require("../controllers/arspMemberController");

const arspAdmitCardController =
require("../controllers/arspAdmitCardController");

router.get(

"/arsp/dashboard",

arspAuth.isLoggedIn,

arspMemberController.dashboard

);

router.get(
    "/arsp/student/admit-card/search",
    arspAuth.isLoggedIn,
    arspMemberController.searchStudentForAdmitCard
);

router.post(
    "/arsp/student/admit-card/download",
    arspAuth.isLoggedIn,
    arspAdmitCardController.download
);

module.exports = router;
