const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const chancellorMessageController = require("../controllers/chancellorMessageController");
const createUploader = require("../middlewares/upload");

const upload = createUploader("chancellor");

// ======================================
// Chancellor Message Routes
// ======================================

// All Messages
router.get(
    "/chancellor-messages",
    chancellorMessageController.showMessages
);

// Add
router.get(
    "/chancellor-message/add",
    chancellorMessageController.addPage
);

router.post(
    "/chancellor-message/add",
    upload.single("image"),
    chancellorMessageController.create
);

// Edit
router.get(
    "/chancellor-message/:id/edit",
    chancellorMessageController.editPage
);

router.post(
    "/chancellor-message/:id/edit",
    upload.single("image"),
    chancellorMessageController.update
);

// Delete
router.post(
    "/chancellor-message/:id/delete",
    chancellorMessageController.delete
);

module.exports = router;
