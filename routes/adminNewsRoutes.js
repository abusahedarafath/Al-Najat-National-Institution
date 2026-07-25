const express = require("express");
const router = express.Router();

const adminNewsController = require("../controllers/adminNewsController");
const authMiddleware = require("../middleware/auth");
const createUploader = require("../middleware/uploadFactory");

const upload = createUploader("news");

// List News
router.get(
    "/admin/news",
    authMiddleware.isLoggedIn,
    adminNewsController.index
);

// Create News Form
router.get(
    "/admin/news/create",
    authMiddleware.isLoggedIn,
    adminNewsController.createPage
);

// Save News
router.post(
    "/admin/news/create",
    authMiddleware.isLoggedIn,
    upload.single("image"),
    adminNewsController.store
);

// Edit News Form
router.get(
    "/admin/news/:id/edit",
    authMiddleware.isLoggedIn,
    adminNewsController.editPage
);

// Update News
router.post(
    "/admin/news/:id/edit",
    authMiddleware.isLoggedIn,
    upload.single("image"),
    adminNewsController.update
);

// Delete News
router.post(
    "/admin/news/:id/delete",
    authMiddleware.isLoggedIn,
    adminNewsController.delete
);

module.exports = router;
