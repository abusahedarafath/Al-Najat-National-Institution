const QuickAccess = require("../models/QuickAccess");

// ===============================
// Show All
// ===============================

exports.index = async (req, res) => {

    try {

        const items = await QuickAccess.getAll();

        res.render("admin/quick-access", {

            title: "Quick Access Management",
            items

        });

    } catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};

// ===============================
// Add Page
// ===============================

exports.addPage = (req, res) => {

    res.render("admin/add-quick-access", {

        title: "Add Quick Access"

    });

};

// ===============================
// Create
// ===============================

exports.create = async (req, res) => {

    try {

        await QuickAccess.create(req.body);

        res.redirect("/admin/quick-access");

    } catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};

// ===============================
// Edit Page
// ===============================

exports.editPage = async (req, res) => {

    try {

        const item = await QuickAccess.getById(req.params.id);

        res.render("admin/edit-quick-access", {

            title: "Edit Quick Access",
            item

        });

    } catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};

// ===============================
// Update
// ===============================

exports.update = async (req, res) => {

    try {

        await QuickAccess.update(req.params.id, req.body);

        res.redirect("/admin/quick-access");

    } catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};

// ===============================
// Delete
// ===============================

exports.delete = async (req, res) => {

    try {

        await QuickAccess.delete(req.params.id);

        res.redirect("/admin/quick-access");

    } catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};
