const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const controller =
    require("../controllers/tirangaCertificateController");

const uploadDir =
    path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "tiranga"
    );

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {

        const ext =
            path.extname(file.originalname).toLowerCase();

        const safeName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            ext;

        cb(null, safeName);
    }

});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {

        const allowed = [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        ];

        const ext =
            path.extname(file.originalname).toLowerCase();

        if (!allowed.includes(ext)) {
            return cb(
                new Error("Only JPG, JPEG, PNG and WEBP images are allowed.")
            );
        }

        cb(null, true);
    }
});

router.get(
    "/admin/tiranga-certificate/dashboard",
    controller.adminDashboard
);

router.get(
    "/admin/tiranga-certificate",
    controller.adminSettings
);

router.post(
    "/admin/tiranga-certificate/settings",
    controller.updateSettings
);

router.post(
    "/admin/tiranga-certificate/upload-image",
    upload.single("image"),
    controller.uploadImage
);

router.get(
    "/admin/tiranga-certificate/certificates",
    controller.adminCertificates
);

module.exports = router;
