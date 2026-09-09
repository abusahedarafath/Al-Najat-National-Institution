const express = require("express");
const multer = require("multer");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const homePopupController = require("../controllers/homePopupController");

// Home Popup admin forms are text-only multipart forms.
// No files are accepted.
const homePopupFormBody = multer().none();

router.use("/admin", authMiddleware.isAdmin);

router.get(
    "/admin/home-popups",
    homePopupController.index
);

router.get(
    "/admin/home-popups/add",
    homePopupController.addPage
);

router.post(
    "/admin/home-popups/add",
    homePopupFormBody,
    homePopupController.create
);

router.get(
    "/admin/home-popups/:id/edit",
    homePopupController.editPage
);

router.post(
    "/admin/home-popups/:id/edit",
    homePopupFormBody,
    homePopupController.update
);

router.post(
    "/admin/home-popups/:id/toggle",
    homePopupController.toggle
);

router.post(
    "/admin/home-popups/:id/delete",
    homePopupController.delete
);

module.exports = router;
