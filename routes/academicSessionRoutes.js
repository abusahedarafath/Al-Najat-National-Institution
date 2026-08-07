const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const academicSessionController = require("../controllers/academicSessionController");

// =======================================
// Academic Session Routes
// =======================================

// All Academic Sessions
router.get(
    "/academic-sessions",
    academicSessionController.showSessions
);

// Add Academic Session
router.get(
    "/academic-session/add",
    academicSessionController.addSessionPage
);

router.post(
    "/academic-session/add",
    academicSessionController.createSession
);

// View Academic Session
router.get(
    "/academic-session/:id",
    academicSessionController.viewSession
);

// Edit Academic Session
router.get(
    "/academic-session/:id/edit",
    academicSessionController.editSessionPage
);

router.post(
    "/academic-session/:id/edit",
    academicSessionController.updateSession
);

// Delete Academic Session
router.post(
    "/academic-session/:id/delete",
    academicSessionController.deleteSession
);

module.exports = router;

