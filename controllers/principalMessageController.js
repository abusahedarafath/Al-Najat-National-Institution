const PrincipalMessage = require("../models/PrincipalMessage");

// ======================================
// Show All Principal Messages
// ======================================

exports.showMessages = async (req, res) => {

    try {

        const messages = await PrincipalMessage.getAll();

        res.render("admin/principal-messages", {
            title: "Principal's Message",
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

    res.render("admin/add-principal-message", {
        title: "Add Principal Message"
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

        await PrincipalMessage.create(data);

        res.redirect("/admin/principal-messages");

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

        const message = await PrincipalMessage.getById(req.params.id);

        if (!message) {

            return res.redirect("/admin/principal-messages");

        }

        res.render("admin/edit-principal-message", {
            title: "Edit Principal Message",
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

        const old = await PrincipalMessage.getById(req.params.id);

        const data = {

            name: req.body.name,
            designation: req.body.designation,
            message: req.body.message,
            image: req.file ? req.file.filename : old.image,
            status: req.body.status

        };

        await PrincipalMessage.update(req.params.id, data);

        res.redirect("/admin/principal-messages");

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

        await PrincipalMessage.delete(req.params.id);

        res.redirect("/admin/principal-messages");

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }

};
