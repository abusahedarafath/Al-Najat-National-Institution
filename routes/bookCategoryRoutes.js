const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const bookCategoryController = require("../controllers/bookCategoryController");

// ======================================
// Book Category Routes
// ======================================

// All Book Categories
router.get(
    "/book-categories",
    bookCategoryController.showBookCategories
);

// Add Book Category
router.get(
    "/book-category/add",
    bookCategoryController.addBookCategoryPage
);

router.post(
    "/book-category/add",
    bookCategoryController.createBookCategory
);

// Book Category Details
router.get(
    "/book-category/:id",
    bookCategoryController.viewBookCategory
);

// Edit Book Category
router.get(
    "/book-category/:id/edit",
    bookCategoryController.editBookCategoryPage
);

router.post(
    "/book-category/:id/edit",
    bookCategoryController.updateBookCategory
);

// Delete Book Category
router.post(
    "/book-category/:id/delete",
    bookCategoryController.deleteBookCategory
);

module.exports = router;
