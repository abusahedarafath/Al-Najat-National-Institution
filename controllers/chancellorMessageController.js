const ChancellorMessage = require("../models/ChancellorMessage");

// ======================================
// Show All Chancellor Messages
// ======================================

exports.showMessages = async (req, res) => {

    try {

        const messages = await ChancellorMessage.getAll();

        res.render("admin/chancellor-messages", {
            title: "Chancellor's Message",
            messages
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }

};

// ======================================
// Add Page
// ======================================

exports.addPage = (req, res) => {

    res.render("admin/add-chancellor-message", {
        title: "Add Chancellor Message"
    });

};

// ======================================
// Create
// ======================================

exports.create = async (req, res) => {

    try {

        const data = {

            name: req.body.name,
            designation: req.body.designation,
            message: req.body.message,
            image: req.file ? req.file.filename : null,
            status: req.body.status

        };

        await ChancellorMessage.create(data);

        res.redirect("/admin/chancellor-messages");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Edit Page
// ======================================

exports.editPage = async (req, res) => {

    try {

        const message = await ChancellorMessage.getById(req.params.id);

        if (!message) {

            return res.redirect("/admin/chancellor-messages");

        }

        res.render("admin/edit-chancellor-message", {
            title: "Edit Chancellor Message",
            message
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }

};

// ======================================
// Update
// ======================================

exports.update = async (req, res) => {

    try {

        const old = await ChancellorMessage.getById(req.params.id);

        const data = {

            name: req.body.name,
            designation: req.body.designation,
            message: req.body.message,
            image: req.file ? req.file.filename : old.image,
            status: req.body.status

        };

        await ChancellorMessage.update(req.params.id, data);

        res.redirect("/admin/chancellor-messages");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Delete
// ======================================

exports.delete = async (req, res) => {

    try {

        await ChancellorMessage.delete(req.params.id);

        res.redirect("/admin/chancellor-messages");

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }

};
