const HeaderButton = require("../models/HeaderButton");

exports.index = async (req, res) => {
    try {
        const buttons = await HeaderButton.getAll();

        res.render("admin/header-buttons", {
            title: "Header Buttons",
            buttons
        });

    } catch (err) {
        console.error("Header Buttons Load Error:", err);
        req.flash("error", "Unable to load Header Buttons.");
        res.redirect("/admin");
    }
};

exports.addPage = (req, res) => {
    res.render("admin/add-header-button", {
        title: "Add Header Button"
    });
};

exports.create = async (req, res) => {
    try {
        await HeaderButton.create({
            title: req.body.title,
            icon: req.body.icon,
            url: req.body.url,
            button_color: req.body.button_color,
            display_order: req.body.display_order,
            status: req.body.status
        });

        req.flash("success", "Header Button added successfully.");
        res.redirect("/admin/header-buttons");

    } catch (err) {
        console.error("Header Button Create Error:", err);
        req.flash("error", "Failed to add Header Button.");
        res.redirect("/admin/header-buttons/add");
    }
};

exports.editPage = async (req, res) => {
    try {
        const button = await HeaderButton.getById(req.params.id);

        if (!button) {
            req.flash("error", "Header Button not found.");
            return res.redirect("/admin/header-buttons");
        }

        res.render("admin/edit-header-button", {
            title: "Edit Header Button",
            button
        });

    } catch (err) {
        console.error("Header Button Edit Load Error:", err);
        req.flash("error", "Unable to load Header Button.");
        res.redirect("/admin/header-buttons");
    }
};

exports.update = async (req, res) => {
    try {
        await HeaderButton.update(req.params.id, {
            title: req.body.title,
            icon: req.body.icon,
            url: req.body.url,
            button_color: req.body.button_color,
            display_order: req.body.display_order,
            status: req.body.status
        });

        req.flash("success", "Header Button updated successfully.");
        res.redirect("/admin/header-buttons");

    } catch (err) {
        console.error("Header Button Update Error:", err);
        req.flash("error", "Failed to update Header Button.");
        res.redirect("/admin/header-buttons");
    }
};

exports.delete = async (req, res) => {
    try {
        await HeaderButton.delete(req.params.id);

        req.flash("success", "Header Button deleted successfully.");
        res.redirect("/admin/header-buttons");

    } catch (err) {
        console.error("Header Button Delete Error:", err);
        req.flash("error", "Failed to delete Header Button.");
        res.redirect("/admin/header-buttons");
    }
};
