const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const rtsePublicController =
    require("../controllers/rtsePublicController");

const processRtsePhoto =
    require("../middleware/processRtsePhoto");

// =====================================
// RTSE Upload Configuration
// =====================================

const storage = multer.diskStorage({

    destination(req, file, cb) {
        cb(
            null,
            "public/uploads/rtse"
        );
    },

    filename(req, file, cb) {
        cb(
            null,
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname)
        );
    }

});

const upload = multer({
    storage
});

// =====================================
// RTSE Home
// =====================================

router.get(
    "/",
    (req, res) => {
        res.redirect("/rtse/apply");
    }
);

// =====================================
// Application Form
// =====================================

router.get(
    "/apply",
    rtsePublicController.requireApplicationOpen,
    rtsePublicController.applicationPage
);

// =====================================
// Prepare Application for Review
// =====================================

router.post(
    "/apply",
    upload.fields([
        {
            name: "photo",
            maxCount: 1
        },
        {
            name: "identity_document",
            maxCount: 1
        }
    ]),
    processRtsePhoto,
    rtsePublicController.submitApplication
);

// =====================================
// Review Application
// =====================================

router.get(
    "/review",
    rtsePublicController.reviewApplication
);

// =====================================
// Edit Application
// =====================================

router.get(
    "/edit",
    rtsePublicController.editApplication
);

// =====================================
// Confirm & Submit
// =====================================

router.post(
    "/confirm",
    rtsePublicController.confirmApplication
);

module.exports = router;
