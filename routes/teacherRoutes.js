const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const multer = require("multer");
const path = require("path");

const teacherController = require("../controllers/teacherController");

// =======================================
// Multer Configuration
// =======================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "public/uploads/teachers");
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

const upload = multer({ storage });

// =======================================
// Teacher Routes
// =======================================

// List Teachers
router.get("/teachers", teacherController.showTeachers);

// Add Teacher
router.get("/teacher/add", teacherController.addTeacherPage);
router.post(
    "/teacher/add",
    upload.single("photo"),
    teacherController.createTeacher
);

// View Teacher
router.get("/teacher/:id", teacherController.viewTeacher);

// Edit Teacher
router.get(
    "/teacher/:id/edit",
    teacherController.editTeacherPage
);

router.post(
    "/teacher/:id/edit",
    upload.single("photo"),
    teacherController.updateTeacher
);

// Delete Teacher
router.post(
    "/teacher/:id/delete",
    teacherController.deleteTeacher
);

module.exports = router;
