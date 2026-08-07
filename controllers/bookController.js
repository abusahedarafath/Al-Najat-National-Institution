const Book = require("../models/Book");
const BookCategory = require("../models/BookCategory");

// ======================================
// Display All Books
// ======================================

exports.showBooks = async (req, res) => {

    try {

        const books = await Book.getAll();

        res.render("admin/books", {

            title: "Library Books",

            books

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Add Book Page
// ======================================

exports.addBookPage = async (req, res) => {

    try {

        const categories = await BookCategory.getAll();

        res.render("admin/add-book", {

            title: "Add Book",

            categories

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Create Book
// ======================================

exports.createBook = async (req, res) => {

    try {

        const data = req.body;

        data.available_quantity = data.quantity;

        await Book.create(data);

        res.redirect("/admin/books");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// View Book
// ======================================

exports.viewBook = async (req, res) => {

    try {

        const book = await Book.getById(req.params.id);

        if (!book) {

            return res.redirect("/admin/books");

        }

        res.render("admin/book-details", {

            title: "Book Details",

            book

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Edit Book Page
// ======================================

exports.editBookPage = async (req, res) => {

    try {

        const book = await Book.getById(req.params.id);

        if (!book) {

            return res.redirect("/admin/books");

        }

        const categories = await BookCategory.getAll();

        res.render("admin/edit-book", {

            title: "Edit Book",

            book,

            categories

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Update Book
// ======================================

exports.updateBook = async (req, res) => {

    try {

        await Book.update(req.params.id, req.body);

        res.redirect("/admin/books");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Delete Book
// ======================================

exports.deleteBook = async (req, res) => {

    try {

        await Book.delete(req.params.id);

        res.redirect("/admin/books");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};
