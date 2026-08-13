const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const scrollingMessageController = require("../controllers/scrollingMessageController");

// =====================================
// Scrolling Message Admin Authentication
// =====================================
router.use("/admin", authMiddleware.isAdmin);

// =====================================
// Scrolling Messages
// =====================================

router.get(
    "/admin/scrolling-messages",
    scrollingMessageController.index
);

router.get(
    "/admin/scrolling-messages/add",
    scrollingMessageController.addPage
);

router.post(
    "/admin/scrolling-messages/add",
    scrollingMessageController.create
);

router.get(
    "/admin/scrolling-messages/:id/edit",
    scrollingMessageController.editPage
);

router.post(
    "/admin/scrolling-messages/:id/edit",
    scrollingMessageController.update
);

router.post(
    "/admin/scrolling-messages/:id/delete",
    scrollingMessageController.delete
);

module.exports = router;
