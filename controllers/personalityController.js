const personalityModel = require("../models/personalityModel");

// =============================
// Admin Pages
// =============================

// List
exports.list = async (req, res) => {
    try {
        const personalities = await personalityModel.getAll();

        res.render("admin/personalities/list", {
            title: "Institutional Personalities",
            personalities
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

// Add Form
exports.addForm = (req, res) => {
    res.render("admin/personalities/add", {
        title: "Add Personality"
    });
};

// Save
exports.save = async (req, res) => {
    try {

        const photo = req.file ? req.file.filename : "";

        const data = {
            photo,
            message_title: req.body.message_title,
            name: req.body.name,
            designation: req.body.designation,
            slug: req.body.slug,
            message: req.body.message,
            biography: req.body.biography,
            message_button_text: req.body.message_button_text,
            biography_button_text: req.body.biography_button_text,
            show_homepage: req.body.show_homepage,
            display_order: req.body.display_order,
            status: req.body.status
        };

        await personalityModel.create(data);

        res.redirect("/admin/personalities");

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

// Edit Form
exports.editForm = async (req, res) => {
    try {

        const personality = await personalityModel.getById(req.params.id);

        if (!personality) {
            return res.redirect("/admin/personalities");
        }

        res.render("admin/personalities/edit", {
            title: "Edit Personality",
            personality
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

// Update
exports.update = async (req, res) => {
    try {

        const old = await personalityModel.getById(req.params.id);

        if (!old) {
            return res.redirect("/admin/personalities");
        }

        const data = {
            photo: req.file ? req.file.filename : old.photo,
            message_title: req.body.message_title,
            name: req.body.name,
            designation: req.body.designation,
            slug: req.body.slug,
            message: req.body.message,
            biography: req.body.biography,
            message_button_text: req.body.message_button_text,
            biography_button_text: req.body.biography_button_text,
            show_homepage: req.body.show_homepage,
            display_order: req.body.display_order,
            status: req.body.status
        };

        await personalityModel.update(req.params.id, data);

        res.redirect("/admin/personalities");

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

// Delete
exports.delete = async (req, res) => {
    try {

        await personalityModel.delete(req.params.id);

        res.redirect("/admin/personalities");

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

// =============================
// Public Pages
// =============================

// Full Message
exports.message = async (req, res) => {
    try {

        const personality = await personalityModel.getBySlug(req.params.slug);

        if (!personality) {
            return res.status(404).send("Personality not found");
        }

        res.render("personalities/message", {
            title: personality.message_title,
            personality
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};

// Biography
exports.biography = async (req, res) => {
    try {

        const personality = await personalityModel.getBySlug(req.params.slug);

        if (!personality) {
            return res.status(404).send("Personality not found");
        }

        res.render("personalities/biography", {
            title: personality.name,
            personality
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
};
