const BookIssue = require("../models/BookIssue");
const Book = require("../models/Book");
const Student = require("../models/Student");

// ======================================
// Display All Issued Books
// ======================================

exports.showBookIssues = async (req, res) => {

    try {

        const issues = await BookIssue.getAll();

        res.render("admin/book-issues", {

            title: "Book Issue Management",

            issues

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Issue Book Page
// ======================================

exports.addIssuePage = async (req, res) => {

    try {

        const books = await Book.getAvailable();

        Student.getAll((err, students) => {

            if (err) {

                console.error(err);

                return res.status(500).send(err.stack);

            }

            res.render("admin/add-book-issue", {

                title: "Issue Book",

                books,

                students

            });

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Create Book Issue
// ======================================

exports.createIssue = async (req, res) => {

    try {

        await BookIssue.create(req.body);

        res.redirect("/admin/book-issues");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// View Book Issue
// ======================================

exports.viewIssue = async (req, res) => {

    try {

        const issue = await BookIssue.getById(req.params.id);

        if (!issue) {

            return res.redirect("/admin/book-issues");

        }

        res.render("admin/book-issue-details", {

            title: "Book Issue Details",

            issue

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Edit Book Issue Page
// ======================================

exports.editIssuePage = async (req, res) => {

    try {

        const issue = await BookIssue.getById(req.params.id);

        if (!issue) {

            return res.redirect("/admin/book-issues");

        }

        const books = await Book.getAvailable();

        Student.getAll((err, students) => {

            if (err) {

                return res.status(500).send(err.stack);

            }

            res.render("admin/edit-book-issue", {

                title: "Edit Book Issue",

                issue,

                books,

                students

            });

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Update Book Issue
// ======================================

exports.updateIssue = async (req, res) => {

    try {

        await BookIssue.update(req.params.id, req.body);

        res.redirect("/admin/book-issues");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Return Book
// ======================================

exports.returnBook = async (req, res) => {

    try {

        await BookIssue.returnBook(

            req.params.id,

            req.body.return_date

        );

        res.redirect("/admin/book-issues");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Delete Book Issue
// ======================================

exports.deleteIssue = async (req, res) => {

    try {

        await BookIssue.delete(req.params.id);

        res.redirect("/admin/book-issues");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};
