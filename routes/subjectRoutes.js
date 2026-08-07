const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);


const subjectController = require("../controllers/subjectController");

// =======================================
// Subject Routes
// =======================================

// All Subjects
router.get("/subjects", subjectController.showSubjects);

// Add Subject
router.get("/subject/add", subjectController.addSubjectPage);
router.post("/subject/add", subjectController.createSubject);

// View Subject
router.get("/subject/:id", subjectController.viewSubject);

// Edit Subject
router.get("/subject/:id/edit", subjectController.editSubjectPage);
router.post("/subject/:id/edit", subjectController.updateSubject);

// Delete Subject
router.post("/subject/:id/delete", subjectController.deleteSubject);

module.exports = router;
