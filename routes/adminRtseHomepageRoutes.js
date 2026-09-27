const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const controller = require("../controllers/adminRtseHomepageController");

router.get(
    "/rtse/homepage",
    auth.isAdmin,
    controller.index
);

router.post(
    "/rtse/homepage/:id",
    auth.isAdmin,
    controller.update
);

router.post(
    "/rtse/homepage/:id/toggle",
    auth.isAdmin,
    controller.toggle
);

module.exports = router;
