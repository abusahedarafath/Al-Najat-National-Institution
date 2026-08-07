const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const chairmanMessageController = require("../controllers/chairmanMessageController");
const createUploader = require("../middlewares/upload");

const upload = createUploader("chairman");

// ======================================
// Chairman Message Routes
// ======================================

// All Messages
router.get(
    "/chairman-messages",
    chairmanMessageController.showMessages
);

// Add
router.get(
    "/chairman-message/add",
    chairmanMessageController.addPage
);

router.post(
    "/chairman-message/add",
    upload.single("image"),
    chairmanMessageController.create
);

// Edit
router.get(
    "/chairman-message/:id/edit",
    chairmanMessageController.editPage
);

router.post(
    "/chairman-message/:id/edit",
    upload.single("image"),
    chairmanMessageController.update
);

// Delete
router.post(
    "/chairman-message/:id/delete",
    chairmanMessageController.delete
);

module.exports = router;
