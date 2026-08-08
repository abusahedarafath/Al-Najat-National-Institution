const express = require("express");

const router = express.Router();

const auth =
    require("../middleware/auth");

const footerController =
    require("../controllers/footerController");


// =====================================
// IsAdmin Protection
// =====================================

router.use(
    "/admin",
    auth.isAdmin
);

router.use(
    auth.isLoggedIn
);


// =====================================
// Footer Management
// =====================================

router.get(
    "/admin/footer",
    footerController.index
);


// =====================================
// Footer Settings
// =====================================

router.post(
    "/admin/footer/settings",
    footerController.updateSettings
);


// =====================================
// Footer Links
// =====================================

router.post(
    "/admin/footer/link",
    footerController.addLink
);

router.post(
    "/admin/footer/link/:id/edit",
    footerController.updateLink
);

router.post(
    "/admin/footer/link/:id/delete",
    footerController.deleteLink
);


module.exports = router;
