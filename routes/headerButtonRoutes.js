const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const headerButtonController = require("../controllers/headerButtonController");

// =====================================
// Header Button Admin Authentication
// =====================================
router.use("/admin", authMiddleware.isAdmin);

// =====================================
// Header Buttons
// =====================================

router.get(
    "/admin/header-buttons",
    headerButtonController.index
);

router.get(
    "/admin/header-buttons/add",
    headerButtonController.addPage
);

router.post(
    "/admin/header-buttons/add",
    headerButtonController.create
);

router.get(
    "/admin/header-buttons/:id/edit",
    headerButtonController.editPage
);

router.post(
    "/admin/header-buttons/:id/edit",
    headerButtonController.update
);

router.post(
    "/admin/header-buttons/:id/delete",
    headerButtonController.delete
);

module.exports = router;
