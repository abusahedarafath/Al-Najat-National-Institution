const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

const { isLoggedIn } = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");

router.use(isLoggedIn);
router.use(allowRoles("admin"));






router.post(
    "/application/:id/status",
    authMiddleware.isLoggedIn,
    applicationController.updateStatus
);

router.post(
  "/gallery/:albumId/image/:imageId/caption",
  adminController.updateImageCaption
);
