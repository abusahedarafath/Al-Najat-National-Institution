const BookCategory = require("../models/BookCategory");

// ======================================
// Display All Book Categories
// ======================================

exports.showBookCategories = async (req, res) => {

    try {

        const categories = await BookCategory.getAll();

        res.render("admin/book-categories", {

            title: "Book Categories",

            categories

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Add Book Category Page
// ======================================

exports.addBookCategoryPage = (req, res) => {

    res.render("admin/add-book-category", {

        title: "Add Book Category"

    });

};

// ======================================
// Create Book Category
// ======================================

exports.createBookCategory = async (req, res) => {

    try {

        await BookCategory.create(req.body);

        res.redirect("/admin/book-categories");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// View Book Category
// ======================================

exports.viewBookCategory = async (req, res) => {

    try {

        const category = await BookCategory.getById(req.params.id);

        if (!category) {

            return res.redirect("/admin/book-categories");

        }

        res.render("admin/book-category-details", {

            title: "Book Category Details",

            category

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Edit Book Category Page
// ======================================

exports.editBookCategoryPage = async (req, res) => {

    try {

        const category = await BookCategory.getById(req.params.id);

        if (!category) {

            return res.redirect("/admin/book-categories");

        }

        res.render("admin/edit-book-category", {

            title: "Edit Book Category",

            category

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Update Book Category
// ======================================

exports.updateBookCategory = async (req, res) => {

    try {

        await BookCategory.update(req.params.id, req.body);

        res.redirect("/admin/book-categories");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Delete Book Category
// ======================================

exports.deleteBookCategory = async (req, res) => {

    try {

        await BookCategory.delete(req.params.id);

        res.redirect("/admin/book-categories");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};
