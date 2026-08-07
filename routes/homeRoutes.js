const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");

// ======================================
// Home
// ======================================

router.get("/", homeController.index);

// ======================================
// Chairman Message
// ======================================

router.get(
    "/chairman-message",
    homeController.chairmanMessage
);

// ======================================
// Principal Message
// ======================================

router.get(
    "/principal-message",
    homeController.principalMessage
);

// ======================================
// Chancellor Message
// ======================================

router.get(
    "/chancellor-message",
    homeController.chancellorMessage
);

module.exports = router;
