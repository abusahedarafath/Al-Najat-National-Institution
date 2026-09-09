const express = require("express");
const multer = require("multer");
const router = express.Router();

// Header Button admin forms are submitted as multipart/form-data.
// No files are accepted; multer().none() parses only text fields.
const headerButtonFormBody = multer().none();


const authMiddleware = require("../middleware/auth");
const headerButtonController = require("../controllers/headerButtonController");

// =====================================
// Header Button Admin Authentication
// =====================================
router.use("/admin", authMiddleware.isAdmin);

// =====================================
// Header Buttons
// =====================================

router.get(
    "/admin/header-buttons",
    headerButtonController.index
);

router.get(
    "/admin/header-buttons/add",
    headerButtonController.addPage
);

router.post(
    "/admin/header-buttons/add",
    headerButtonFormBody,
    headerButtonController.create
);

router.get(
    "/admin/header-buttons/:id/edit",
    headerButtonController.editPage
);

router.post(
    "/admin/header-buttons/:id/edit",
    headerButtonFormBody,
    headerButtonController.update
);

router.post(
    "/admin/header-buttons/:id/delete",
    headerButtonController.delete
);

module.exports = router;
