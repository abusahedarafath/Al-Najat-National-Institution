const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const markController = require("../controllers/markController");

// ======================================
// Marks Routes
// ======================================

// All Marks
router.get(
    "/marks",
    markController.showMarks
);

// Add Marks
router.get(
    "/mark/add",
    markController.addMarkPage
);

router.post(
    "/mark/add",
    markController.createMark
);

// Mark Details
router.get(
    "/mark/:id",
    markController.viewMark
);

// Edit Marks
router.get(
    "/mark/:id/edit",
    markController.editMarkPage
);

router.post(
    "/mark/:id/edit",
    markController.updateMark
);

// Delete Marks
router.post(
    "/mark/:id/delete",
    markController.deleteMark
);

module.exports = router;
