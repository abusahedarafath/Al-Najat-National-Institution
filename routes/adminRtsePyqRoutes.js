const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/adminRtsePyqController");

const uploadDir = path.resolve(
    __dirname,
    "../public/uploads/rtse-pyq"
);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        const safeBase = path
            .basename(file.originalname, path.extname(file.originalname))
            .replace(/[^a-zA-Z0-9_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 80) || "rtse-pyq";

        cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1E9)}-${safeBase}.pdf`
        );
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 25 * 1024 * 1024
    },
    fileFilter(req, file, cb) {
        const isPdf =
            file.mimetype === "application/pdf" ||
            path.extname(file.originalname).toLowerCase() === ".pdf";

        if (!isPdf) {
            return cb(new Error("Only PDF files are allowed."));
        }

        return cb(null, true);
    }
});

router.get(
    "/rtse/pyq",
    auth.isAdmin,
    controller.index
);

router.get(
    "/rtse/pyq/create",
    auth.isAdmin,
    controller.createPage
);

router.post(
    "/rtse/pyq",
    auth.isAdmin,
    upload.single("pdf"),
    controller.store
);

router.get(
    "/rtse/pyq/:id/edit",
    auth.isAdmin,
    controller.editPage
);

router.post(
    "/rtse/pyq/:id",
    auth.isAdmin,
    upload.single("pdf"),
    controller.update
);

router.post(
    "/rtse/pyq/:id/toggle",
    auth.isAdmin,
    controller.toggle
);

router.post(
    "/rtse/pyq/:id/delete",
    auth.isAdmin,
    controller.delete
);

module.exports = router;
