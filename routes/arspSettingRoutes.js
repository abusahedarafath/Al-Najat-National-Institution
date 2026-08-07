const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);


const multer = require("multer");
const path = require("path");

const arspSettingController =
    require("../controllers/arspSettingController");

// ==========================
// Upload Configuration
// ==========================

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(
            null,
            "public/uploads/arsp-settings"
        );

    },

    filename(req, file, cb) {

        cb(

            null,

            Date.now() +
            "-" +
            Math.floor(Math.random() * 1000000000) +
            path.extname(file.originalname)

        );

    }

});

const upload = multer({

    storage

});

// ==========================
// Routes
// ==========================

router.get(

    "/admin/arsp/settings",

    arspSettingController.settingsPage

);

router.post(

    "/admin/arsp/settings",

    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "favicon", maxCount: 1 },
        { name: "president_signature", maxCount: 1 },
        { name: "official_seal", maxCount: 1 }
    ]),

    arspSettingController.updateSettings

);

module.exports = router;
