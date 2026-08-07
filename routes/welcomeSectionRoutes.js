const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const welcomeSectionController = require("../controllers/welcomeSectionController");

// ======================================
// Welcome Section Routes
// ======================================

// List
router.get(
    "/welcome-sections",
    welcomeSectionController.showWelcomeSections
);

// Add
router.get(
    "/welcome-section/add",
    welcomeSectionController.addPage
);

router.post(
    "/welcome-section/add",
    welcomeSectionController.create
);

// Edit
router.get(
    "/welcome-section/:id/edit",
    welcomeSectionController.editPage
);

router.post(
    "/welcome-section/:id/edit",
    welcomeSectionController.update
);

// Delete
router.post(
    "/welcome-section/:id/delete",
    welcomeSectionController.delete
);

module.exports = router;
