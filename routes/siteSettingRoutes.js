const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const createUploader = require("../middleware/uploadFactory");

const siteSettingController = require("../controllers/siteSettingController");

const upload = createUploader("site-settings");

// Protect every route
router.use(authMiddleware.isLoggedIn);

// Institution Settings Page
router.get(
    "/site-settings",
    siteSettingController.index
);

// Update Settings
router.post(
    "/site-settings",
    upload.fields([
        {
            name: "logo",
            maxCount: 1
        },
        {
            name: "favicon",
            maxCount: 1
        }
    ]),
    siteSettingController.update
);

module.exports = router;
