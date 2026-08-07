const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);


const principalMessageController = require("../controllers/principalMessageController");
const createUploader = require("../middlewares/upload");

const upload = createUploader("principal");

// ======================================
// Principal Message Routes
// ======================================

// All Messages
router.get(
    "/principal-messages",
    principalMessageController.showMessages
);

// Add
router.get(
    "/principal-message/add",
    principalMessageController.addPage
);

router.post(
    "/principal-message/add",
    upload.single("image"),
    principalMessageController.create
);

// Edit
router.get(
    "/principal-message/:id/edit",
    principalMessageController.editPage
);

router.post(
    "/principal-message/:id/edit",
    upload.single("image"),
    principalMessageController.update
);

// Delete
router.post(
    "/principal-message/:id/delete",
    principalMessageController.delete
);

module.exports = router;
