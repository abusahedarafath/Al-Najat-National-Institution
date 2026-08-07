const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);


const createUploader = require("../middleware/uploadFactory");

const upload = createUploader("id-card");

const identityCardController = require("../controllers/identityCardController");

router.get(
    "/admin/id-card/settings",
    authMiddleware.isLoggedIn,
    identityCardController.settingsPage
);

router.post(
    "/admin/id-card/settings",
    authMiddleware.isLoggedIn,

upload.fields([
    { name: "background", maxCount: 1 }
]),

    identityCardController.saveSettings
);

module.exports = router;
