const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const classController = require("../controllers/classController");

// =======================================
// Class Routes
// =======================================

// All Classes
router.get("/classes", classController.showClasses);

// Add Class
router.get("/class/add", classController.addClassPage);
router.post("/class/add", classController.createClass);

// View Class
router.get("/class/:id", classController.viewClass);

// Edit Class
router.get("/class/:id/edit", classController.editClassPage);
router.post("/class/:id/edit", classController.updateClass);

// Delete Class
router.post("/class/:id/delete", classController.deleteClass);

module.exports = router;
