const FeeCategory = require("../models/FeeCategory");

// ======================================
// Display All Fee Categories
// ======================================

exports.showFeeCategories = async (req, res) => {
    try {
        const categories = await FeeCategory.getAll();

        res.render("admin/fee-categories", {
            title: "Fee Categories",
            categories
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// ======================================
// Add Fee Category Page
// ======================================

exports.addFeeCategoryPage = (req, res) => {
    res.render("admin/add-fee-category", {
        title: "Add Fee Category"
    });
};

// ======================================
// Create Fee Category
// ======================================

exports.createFeeCategory = async (req, res) => {
    try {
        await FeeCategory.create(req.body);
        res.redirect("/admin/fee-categories");

    } catch (err) {
        console.error(err);
        res.status(500).send("Unable to create fee category.");
    }
};

// ======================================
// View Fee Category
// ======================================

exports.viewFeeCategory = async (req, res) => {
    try {
        const result = await FeeCategory.getById(req.params.id);

        if (!result.length) {
            return res.redirect("/admin/fee-categories");
        }

        res.render("admin/fee-category-details", {
            title: "Fee Category Details",
            category: result[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// ======================================
// Edit Fee Category Page
// ======================================

exports.editFeeCategoryPage = async (req, res) => {
    try {
        const result = await FeeCategory.getById(req.params.id);

        if (!result.length) {
            return res.redirect("/admin/fee-categories");
        }

        res.render("admin/edit-fee-category", {
            title: "Edit Fee Category",
            category: result[0]
        });

    } catch (err) {
        console.error(err);
        res.redirect("/admin/fee-categories");
    }
};

// ======================================
// Update Fee Category
// ======================================

exports.updateFeeCategory = async (req, res) => {
    try {
        await FeeCategory.update(req.params.id, req.body);
        res.redirect("/admin/fee-categories");

    } catch (err) {
        console.error(err);
        res.status(500).send("Unable to update fee category.");
    }
};

// ======================================
// Delete Fee Category
// ======================================

exports.deleteFeeCategory = async (req, res) => {
    try {
        await FeeCategory.delete(req.params.id);
        res.redirect("/admin/fee-categories");

    } catch (err) {
        console.error(err);
        res.status(500).send("Unable to delete fee category.");
    }
};
