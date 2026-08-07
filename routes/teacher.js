const express = require("express");
const router = express.Router();

const teacherController = require("../controllers/teacherController");

const { isLoggedIn } = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");

// Protect all teacher management routes
router.use(isLoggedIn);
router.use(allowRoles("admin"));

// Teacher List
router.get("/teachers", teacherController.showTeachers);

// Add Teacher
router.get("/teacher/add", teacherController.showAddTeacher);
router.post("/teacher/add", teacherController.saveTeacher);

// Teacher Profile
router.get("/teacher/:id", teacherController.showTeacherProfile);

// Edit Teacher
router.get("/teacher/:id/edit", teacherController.showEditTeacher);
router.post("/teacher/:id/edit", teacherController.updateTeacher);

// Delete Teacher
router.post("/teacher/:id/delete", teacherController.deleteTeacher);

module.exports = router;
