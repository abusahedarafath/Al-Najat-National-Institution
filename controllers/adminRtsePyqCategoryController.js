"use strict";

const RtsePyqCategory = require("../models/RtsePyqCategory");

exports.index = async (req, res) => {
    try {
        const categories = await RtsePyqCategory.getAll(true);

        return res.render("admin/rtse/pyq/categories", {
            title: "RTSE PYQ Year Categories",
            categories
        });
    } catch (err) {
        console.error("RTSE PYQ category index error:", err);
        req.flash("error", "Unable to load PYQ year categories.");
        return res.redirect("/admin/rtse/pyq/categories");
    }
};

exports.createPage = (req, res) => {
    return res.render("admin/rtse/pyq/category-create", {
        title: "Create PYQ Year Category"
    });
};

exports.store = async (req, res) => {
    try {
        const body = req.body || {};

        const year = Number.parseInt(body.year, 10);
        const displayOrder = Number.parseInt(body.display_order, 10);
        const title = (body.title || "").trim();

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            req.flash("error", "Please enter a valid year.");
            return res.redirect("/admin/rtse/pyq/categories/create");
        }

        if (!title) {
            req.flash("error", "Please enter a category title.");
            return res.redirect("/admin/rtse/pyq/categories/create");
        }

        const existing = await RtsePyqCategory.getByYear(year);

        if (existing) {
            req.flash("error", `A category for ${year} already exists.`);
            return res.redirect("/admin/rtse/pyq/categories/create");
        }

        await RtsePyqCategory.create({
            year,
            title,
            display_order: Number.isInteger(displayOrder) ? displayOrder : 0,
            is_active: body.is_active === "1" ? 1 : 0
        });

        req.flash("success", `${year} PYQ category created successfully.`);
        return res.redirect("/admin/rtse/pyq/categories");
    } catch (err) {
        console.error("RTSE PYQ category create error:", err);
        req.flash("error", "Failed to create PYQ category.");
        return res.redirect("/admin/rtse/pyq/categories/create");
    }
};

exports.editPage = async (req, res) => {
    try {
        const category = await RtsePyqCategory.getById(req.params.id);

        if (!category) {
            req.flash("error", "PYQ category not found.");
            return res.redirect("/admin/rtse/pyq/categories");
        }

        return res.render("admin/rtse/pyq/category-edit", {
            title: "Edit PYQ Year Category",
            category
        });
    } catch (err) {
        console.error("RTSE PYQ category edit page error:", err);
        req.flash("error", "Unable to load PYQ category.");
        return res.redirect("/admin/rtse/pyq/categories");
    }
};

exports.update = async (req, res) => {
    try {
        const category = await RtsePyqCategory.getById(req.params.id);

        if (!category) {
            req.flash("error", "PYQ category not found.");
            return res.redirect("/admin/rtse/pyq/categories");
        }

        const year = Number.parseInt(req.body.year, 10);
        const displayOrder = Number.parseInt(req.body.display_order, 10);
        const title = (req.body.title || "").trim();

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            req.flash("error", "Please enter a valid year.");
            return res.redirect(
                `/admin/rtse/pyq/categories/${req.params.id}/edit`
            );
        }

        if (!title) {
            req.flash("error", "Please enter a category title.");
            return res.redirect(
                `/admin/rtse/pyq/categories/${req.params.id}/edit`
            );
        }

        const existing = await RtsePyqCategory.getByYear(year);

        if (existing && Number(existing.id) !== Number(req.params.id)) {
            req.flash("error", `A category for ${year} already exists.`);
            return res.redirect(
                `/admin/rtse/pyq/categories/${req.params.id}/edit`
            );
        }

        await RtsePyqCategory.update(req.params.id, {
            year,
            title,
            display_order: Number.isInteger(displayOrder) ? displayOrder : 0,
            is_active: req.body.is_active === "1" ? 1 : 0
        });

        req.flash("success", "PYQ category updated successfully.");
        return res.redirect("/admin/rtse/pyq/categories");
    } catch (err) {
        console.error("RTSE PYQ category update error:", err);
        req.flash("error", "Failed to update PYQ category.");
        return res.redirect("/admin/rtse/pyq/categories");
    }
};

exports.toggle = async (req, res) => {
    try {
        await RtsePyqCategory.toggle(req.params.id);
        req.flash("success", "PYQ category status updated.");
    } catch (err) {
        console.error("RTSE PYQ category toggle error:", err);
        req.flash("error", "Failed to update PYQ category status.");
    }

    return res.redirect("/admin/rtse/pyq/categories");
};

exports.delete = async (req, res) => {
    try {
        /*
         * The database foreign key uses ON DELETE SET NULL.
         * Therefore existing PYQ records remain intact.
         * No PDF file is ever deleted.
         */
        await RtsePyqCategory.delete(req.params.id);

        req.flash(
            "success",
            "PYQ year category removed. Existing PYQ records were preserved."
        );
    } catch (err) {
        console.error("RTSE PYQ category delete error:", err);
        req.flash("error", "Failed to remove PYQ category.");
    }

    return res.redirect("/admin/rtse/pyq/categories");
};
