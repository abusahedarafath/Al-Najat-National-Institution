const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const superScannerController = require("../controllers/superScannerController");
const rtseCountedOmrController =
    require("../controllers/rtseCountedOmrController");

const multer = require("multer");

const rtseCountedOmrUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 12 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPEG, PNG and WebP images are allowed."
                )
            );
        }
    }
});

// =====================================
// Super Scanner Dashboard
// =====================================

router.get(
    "/super-scanner",
    auth.isSuperScanner,
    superScannerController.dashboard
);


// =====================================
// QR Lookup
// =====================================

router.post(
    "/super-scanner/lookup",
    auth.isSuperScanner,
    superScannerController.lookup
);


// =====================================
// Mark Attendance
// =====================================

router.post(
    "/super-scanner/mark-present",
    auth.isSuperScanner,
    superScannerController.markPresent
);

/* =====================================
   Result QR Result Entry
===================================== */

router.post(
    "/super-scanner/result/:id",
    auth.isSuperScanner,
    superScannerController.saveResult
);

router.post(
    "/super-scanner/counted-omr/:id",
    auth.isSuperScanner,
    rtseCountedOmrUpload.single("counted_omr"),
    rtseCountedOmrController.upload
);

router.get(
    "/super-scanner/counted-omr/:id",
    auth.isSuperScanner,
    rtseCountedOmrController.view
);

module.exports = router;
