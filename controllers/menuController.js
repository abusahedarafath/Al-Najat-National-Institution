const Menu = require("../models/Menu");

// ===============================
// Menu List
// ===============================

exports.index = async (req, res) => {

    try {

        const menus = await Menu.getAll();

        res.render("admin/menu/index", {

            title: "Navigation Menu",

            menus

        });

    } catch (err) {

        console.error(err);

        req.flash("error", "Unable to load menus.");

        res.redirect("/admin");

    }

};


// ===============================
// Add Menu Page
// ===============================

exports.createPage = async (req, res) => {

    try {

        const parents = await Menu.getParents();

        res.render("admin/menu/create", {

            title: "Add Menu",

            parents

        });

    } catch (err) {

        console.error(err);

        res.redirect("/admin/menu");

    }

};


// ===============================
// Store Menu
// ===============================

exports.store = async (req, res) => {

    try {

        await Menu.create(req.body);

        req.flash(

            "success",

            "Menu added successfully."

        );

        res.redirect("/admin/menu");

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to save menu."

        );

        res.redirect("/admin/menu/create");

    }

};


// ===============================
// Edit Page
// ===============================

exports.editPage = async (req, res) => {

    try {

        const menu = await Menu.getById(req.params.id);

        const parents = await Menu.getParents();

        if (!menu) {

            req.flash(

                "error",

                "Menu not found."

            );

            return res.redirect("/admin/menu");

        }

        res.render("admin/menu/edit", {

            title: "Edit Menu",

            menu,

            parents

        });

    } catch (err) {

        console.error(err);

        res.redirect("/admin/menu");

    }

};


// ===============================
// Update
// ===============================

exports.update = async (req, res) => {

    try {

        await Menu.update(

            req.params.id,

            req.body

        );

        req.flash(

            "success",

            "Menu updated."

        );

        res.redirect("/admin/menu");

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Update failed."

        );

        res.redirect("/admin/menu");

    }

};


// ===============================
// Delete
// ===============================

exports.delete = async (req, res) => {

    try {

        await Menu.delete(req.params.id);

        req.flash(

            "success",

            "Menu deleted."

        );

        res.redirect("/admin/menu");

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Delete failed."

        );

        res.redirect("/admin/menu");

    }

};
