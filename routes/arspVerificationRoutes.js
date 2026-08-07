const express = require("express");
const router = express.Router();

const arspVerificationController =
require("../controllers/arspVerificationController");

router.get(
    "/arsp/document/verify/:documentNumber",
    arspVerificationController.verify
);

module.exports = router;
