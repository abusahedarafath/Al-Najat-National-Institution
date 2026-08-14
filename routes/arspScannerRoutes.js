const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/arspScannerController");

router.post(
    "/arsp/scanner/verify",
    express.json(),
    controller.verify
);

module.exports = router;
