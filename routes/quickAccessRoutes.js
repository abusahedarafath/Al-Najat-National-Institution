const express = require("express");
const router = express.Router();

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
    quickAccessController.create
);

// Edit
router.get(
    "/quick-access/:id/edit",
    quickAccessController.editPage
);

router.post(
    "/quick-access/:id/edit",
    quickAccessController.update
);

// Delete
router.post(
    "/quick-access/:id/delete",
    quickAccessController.delete
);

module.exports = router;
