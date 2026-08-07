const express = require("express");

const router = express.Router();

const arspAuth = require("../middleware/arspAuth");

const arspMemberController =
require("../controllers/arspMemberController");

router.get(

"/arsp/dashboard",

arspAuth.isLoggedIn,

arspMemberController.dashboard

);

module.exports = router;
