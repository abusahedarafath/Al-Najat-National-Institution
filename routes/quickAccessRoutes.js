const express = require("express");
const multer = require("multer");
const router = express.Router();

// Quick Access admin forms are submitted as multipart/form-data.
// No files are accepted; multer().none() parses only the text fields.
const quickAccessFormBody = multer().none();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const quickAccessController = require("../controllers/quickAccessController");


// ===============================
// Quick Access Routes
// ===============================

// All Items
router.get(
    "/quick-access",
    quickAccessController.index
);

// Add
router.get(
    "/quick-access/add",
    quickAccessController.addPage
);

router.post(
    "/quick-access/add",
    quickAccessFormBody,
    quickAccessController.create
);

// Edit
router.get(
    "/quick-access/:id/edit",
    quickAccessController.editPage
);

router.post(
    "/quick-access/:id/edit",
    quickAccessFormBody,
    quickAccessController.update
);

// Delete
router.post(
    "/quick-access/:id/delete",
    quickAccessController.delete
);

module.exports = router;
