const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);


const adminNoticeController = require("../controllers/adminNoticeController");
const createUploader = require("../middleware/uploadFactory");

const upload = createUploader("notices");
// List Notices
router.get(
    "/admin/notices",
    authMiddleware.isLoggedIn,
    adminNoticeController.index
);

// Create Notice Form
router.get(
    "/admin/notices/create",
    authMiddleware.isLoggedIn,
    adminNoticeController.createPage
);

// Save Notice
router.post(
    "/admin/notices/create",
    authMiddleware.isLoggedIn,
    upload.single("file"),
    adminNoticeController.store
);

// Edit Notice Form
router.get(
    "/admin/notices/:id/edit",
    authMiddleware.isLoggedIn,
    adminNoticeController.editPage
);

// Update Notice
router.post(
    "/admin/notices/:id/edit",
    authMiddleware.isLoggedIn,
    upload.single("file"),
    adminNoticeController.update
);

// Delete Notice
router.post(
    "/admin/notices/:id/delete",
    authMiddleware.isLoggedIn,
    adminNoticeController.delete
);

module.exports = router;
