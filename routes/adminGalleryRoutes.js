const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const adminGalleryController = require("../controllers/adminGalleryController");
const createUploader = require("../middleware/uploadFactory");
const upload = createUploader("gallery");

// ==========================
// Gallery Dashboard
// ==========================

router.get(
    "/admin/gallery",
    adminGalleryController.index
);

router.get(
    "/admin/gallery/create",
    adminGalleryController.createPage
);

router.post(
    "/admin/gallery/store",
    upload.single("cover_image"),
    adminGalleryController.store
);

router.get(
    "/admin/gallery/:id/edit",
    adminGalleryController.editPage
);

router.post(
    "/admin/gallery/:id/edit",
    upload.single("cover_image"),
    adminGalleryController.update
);

router.get(
    "/admin/gallery/delete/:id",
    adminGalleryController.delete
);

// ==========================
// Manage Album Images
// ==========================

router.get(
    "/admin/gallery/:id/images",
    adminGalleryController.imagesPage
);

// ==========================
// Upload Multiple Images
// ==========================

router.post(
    "/admin/gallery/:id/images",
    upload.array("images", 20),
    adminGalleryController.uploadImages
);

// ==========================
// Delete Image
// ==========================

router.get(
    "/admin/gallery/image/delete/:imageId",
    adminGalleryController.deleteImage
);

router.post(
    "/admin/gallery/:albumId/image/:imageId/caption",
    adminGalleryController.updateImageCaption
);

module.exports = router;
