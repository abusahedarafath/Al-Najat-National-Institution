const WelcomeSection = require("../models/WelcomeSection");

// ======================================
// Show All Welcome Sections
// ======================================

exports.showWelcomeSections = async (req, res) => {
    try {

        const sections = await WelcomeSection.getAll();

        res.render("admin/welcome-sections", {
            title: "Welcome Section",
            sections
        });

    } catch (err) {

        console.error(err);
        res.status(500).send(err.stack);

    }
};

// ======================================
// Add Page
// ======================================

exports.addPage = (req, res) => {

    res.render("admin/add-welcome-section", {
        title: "Add Welcome Section"
    });

};

// ======================================
// Create
// ======================================

exports.create = async (req, res) => {

    try {

        await WelcomeSection.create(req.body);

        res.redirect("/admin/welcome-sections");

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

        const section = await WelcomeSection.getById(req.params.id);

        if (!section) {
            return res.redirect("/admin/welcome-sections");
        }

        res.render("admin/edit-welcome-section", {
            title: "Edit Welcome Section",
            section
        });

    } catch (err) {

        console.error(err);
        res.status(500).send(err.stack);

    }

};

// ======================================
// Update
// ======================================

exports.update = async (req, res) => {

    try {

        await WelcomeSection.update(req.params.id, req.body);

        res.redirect("/admin/welcome-sections");

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

        await WelcomeSection.delete(req.params.id);

        res.redirect("/admin/welcome-sections");

    } catch (err) {

        console.error(err);
        res.status(500).send(err.stack);

    }

};
