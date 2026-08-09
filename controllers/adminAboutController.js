const About = require("../models/About");

// =====================================
// Manage About Sections
// =====================================
exports.index = async (req, res) => {
    try {
        const sections = await About.getAll();

        res.render("admin/about/index", {
            title: "Manage About Us",
            sections
        });

    } catch (err) {
        console.error("Admin About Error:", err);
        req.flash("error", "Unable to load About Us sections.");
        res.redirect("/admin/dashboard");
    }
};

// =====================================
// Add About Section Page
// =====================================
exports.createPage = (req, res) => {
    res.render("admin/about/create", {
        title: "Add About Section"
    });
};

// =====================================
// Create About Section
// =====================================
exports.create = async (req, res) => {
    try {
        await About.create({
            section_key: req.body.section_key,
            title: req.body.title,
            content: req.body.content,
            image: req.body.image || null,
            display_order: Number(req.body.display_order) || 0,
            is_active: req.body.is_active ? 1 : 0
        });

        req.flash(
            "success",
            "About Us section added successfully."
        );

        res.redirect("/admin/about");

    } catch (err) {
        console.error("Create About Error:", err);

        req.flash(
            "error",
            "Unable to add About Us section."
        );

        res.redirect("/admin/about/create");
    }
};

// =====================================
// Edit About Section Page
// =====================================
exports.editPage = async (req, res) => {
    try {
        const section = await About.getById(req.params.id);

        if (!section) {
            req.flash("error", "About Us section not found.");
            return res.redirect("/admin/about");
        }

        res.render("admin/about/edit", {
            title: "Edit About Section",
            section
        });

    } catch (err) {
        console.error("Edit About Error:", err);

        req.flash(
            "error",
            "Unable to load About Us section."
        );

        res.redirect("/admin/about");
    }
};

// =====================================
// Update About Section
// =====================================
exports.update = async (req, res) => {
    try {
        await About.update(req.params.id, {
            section_key: req.body.section_key,
            title: req.body.title,
            content: req.body.content,
            image: req.body.image || null,
            display_order: Number(req.body.display_order) || 0,
            is_active: req.body.is_active ? 1 : 0
        });

        req.flash(
            "success",
            "About Us section updated successfully."
        );

        res.redirect("/admin/about");

    } catch (err) {
        console.error("Update About Error:", err);

        req.flash(
            "error",
            "Unable to update About Us section."
        );

        res.redirect(
            `/admin/about/${req.params.id}/edit`
        );
    }
};

// =====================================
// Delete About Section
// =====================================
exports.delete = async (req, res) => {
    try {
        await About.delete(req.params.id);

        req.flash(
            "success",
            "About Us section deleted successfully."
        );

    } catch (err) {
        console.error("Delete About Error:", err);

        req.flash(
            "error",
            "Unable to delete About Us section."
        );
    }

    res.redirect("/admin/about");
};

// =====================================
// Toggle Active / Inactive
// =====================================
exports.toggle = async (req, res) => {
    try {
        await About.toggle(req.params.id);

        req.flash(
            "success",
            "About Us section status updated."
        );

    } catch (err) {
        console.error("Toggle About Error:", err);

        req.flash(
            "error",
            "Unable to change section status."
        );
    }

    res.redirect("/admin/about");
};
