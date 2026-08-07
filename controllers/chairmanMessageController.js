const ChairmanMessage = require("../models/ChairmanMessage");

// ======================================
// Show All Chairman Messages
// ======================================

exports.showMessages = async (req, res) => {

    try {

        const messages = await ChairmanMessage.getAll();

        res.render("admin/chairman-messages", {
            title: "Chairman's Messages",
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

    res.render("admin/add-chairman-message", {
        title: "Add Chairman Message"
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
            display_order: req.body.display_order,
            status: req.body.status

        };

        await ChairmanMessage.create(data);

        res.redirect("/admin/chairman-messages");

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

        const message = await ChairmanMessage.getById(req.params.id);

        if (!message) {

            return res.redirect("/admin/chairman-messages");

        }

        res.render("admin/edit-chairman-message", {

            title: "Edit Chairman Message",

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

        const old = await ChairmanMessage.getById(req.params.id);

        const data = {

            name: req.body.name,
            designation: req.body.designation,
            message: req.body.message,
            image: req.file ? req.file.filename : old.image,
            display_order: req.body.display_order,
            status: req.body.status

        };

        await ChairmanMessage.update(req.params.id, data);

        res.redirect("/admin/chairman-messages");

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

        await ChairmanMessage.delete(req.params.id);

        res.redirect("/admin/chairman-messages");

    } catch (err) {

        console.error(err);

        res.status(500).send("Database Error");

    }

};
