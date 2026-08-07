const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const examController = require("../controllers/examController");

// ======================================
// Examination Routes
// ======================================

// All Examinations
router.get(
    "/exams",
    examController.showExams
);

// Add Examination
router.get(
    "/exam/add",
    examController.addExamPage
);

router.post(
    "/exam/add",
    examController.createExam
);

// Examination Details
router.get(
    "/exam/:id",
    examController.viewExam
);

// Edit Examination
router.get(
    "/exam/:id/edit",
    examController.editExamPage
);

router.post(
    "/exam/:id/edit",
    examController.updateExam
);

// Delete Examination
router.post(
    "/exam/:id/delete",
    examController.deleteExam
);

module.exports = router;
