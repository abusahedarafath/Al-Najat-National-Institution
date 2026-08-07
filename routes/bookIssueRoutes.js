const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);

const bookIssueController = require("../controllers/bookIssueController");

// ======================================
// Book Issue Routes
// ======================================

// All Issued Books
router.get(
    "/book-issues",
    bookIssueController.showBookIssues
);

// Issue Book
router.get(
    "/book-issue/add",
    bookIssueController.addIssuePage
);

router.post(
    "/book-issue/add",
    bookIssueController.createIssue
);

// View Book Issue
router.get(
    "/book-issue/:id",
    bookIssueController.viewIssue
);

// Edit Book Issue
router.get(
    "/book-issue/:id/edit",
    bookIssueController.editIssuePage
);

router.post(
    "/book-issue/:id/edit",
    bookIssueController.updateIssue
);

// Return Book
router.post(
    "/book-issue/:id/return",
    bookIssueController.returnBook
);

// Delete Book Issue
router.post(
    "/book-issue/:id/delete",
    bookIssueController.deleteIssue
);

module.exports = router;
