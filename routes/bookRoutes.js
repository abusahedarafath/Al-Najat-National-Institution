const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use(authMiddleware.isLoggedIn);


const multer = require("multer");
const path = require("path");

const bookController = require("../controllers/bookController");

// ======================================
// Multer Configuration
// ======================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            "public/uploads/books"
        );

    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );

    }

});

const upload = multer({

    storage,

    fileFilter: (req, file, cb) => {

        const allowed = /jpg|jpeg|png|webp/i;

        const ext = allowed.test(
            path.extname(file.originalname)
        );

        const mime = allowed.test(
            file.mimetype
        );

        if (ext && mime) {

            cb(null, true);

        } else {

            cb(
                new Error("Only image files are allowed.")
            );

        }

    }

});

// ======================================
// Book Routes
// ======================================

// All Books
router.get(
    "/books",
    bookController.showBooks
);

// Add Book
router.get(
    "/book/add",
    bookController.addBookPage
);

router.post(
    "/book/add",
    upload.single("cover_image"),
    bookController.createBook
);

// View Book
router.get(
    "/book/:id",
    bookController.viewBook
);

// Edit Book
router.get(
    "/book/:id/edit",
    bookController.editBookPage
);

router.post(
    "/book/:id/edit",
    upload.single("cover_image"),
    bookController.updateBook
);

// Delete Book
router.post(
    "/book/:id/delete",
    bookController.deleteBook
);

module.exports = router;
