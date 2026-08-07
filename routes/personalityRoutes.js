const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const personalityController = require("../controllers/personalityController");
const { isAdmin } = require("../middleware/auth");

// ======================================
// Multer Configuration
// ======================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "public/uploads/personalities");

    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );

    }

});

const upload = multer({ storage });


// ======================================
// ADMIN ROUTES
// ======================================

// List
router.get(
    "/admin/personalities",
    isAdmin,
    personalityController.list
);

// Add Form
router.get(
    "/admin/personalities/add",
    isAdmin,
    personalityController.addForm
);

// Save
router.post(
    "/admin/personalities/add",
    isAdmin,
    upload.single("photo"),
    personalityController.save
);

// Edit Form
router.get(
    "/admin/personalities/edit/:id",
    isAdmin,
    personalityController.editForm
);

// Update
router.post(
    "/admin/personalities/edit/:id",
    isAdmin,
    upload.single("photo"),
    personalityController.update
);

// Delete
router.get(
    "/admin/personalities/delete/:id",
    isAdmin,
    personalityController.delete
);


// ======================================
// PUBLIC ROUTES
// ======================================

// Full Message
router.get(
    "/personality/:slug",
    personalityController.message
);

// Biography
router.get(
    "/personality/:slug/biography",
    personalityController.biography
);

module.exports = router;
