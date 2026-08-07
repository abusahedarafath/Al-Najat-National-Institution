const fs = require("fs");
const path = require("path");

const HeroSlider = require("../models/HeroSlider");

exports.index = async (req, res) => {
    try {
        const sliders = await HeroSlider.getAll();

        res.render("admin/hero-slider/index", {
            title: "Hero Sliders",
            sliders
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load sliders.");
        res.redirect("/admin");
    }
};

exports.createPage = (req, res) => {
    res.render("admin/hero-slider/create", {
        title: "Add Hero Slider"
    });
};




exports.store = async (req, res) => {
    try {
        const image = req.file ? req.file.filename : "";

        await HeroSlider.create({
            title: req.body.title,
            subtitle: req.body.subtitle,
            button_text: req.body.button_text,
            button_link: req.body.button_link,
            image,
            display_order: req.body.display_order || 1,
            status: req.body.status || "Active"
        });

        req.flash("success", "Hero slider added successfully.");
        res.redirect("/admin/sliders");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to create hero slider.");
        res.redirect("/admin/sliders/create");
    }
};




exports.editPage = async (req, res) => {
    try {
        const slider = await HeroSlider.getById(req.params.id);

        if (!slider) {
            req.flash("error", "Slider not found.");
            return res.redirect("/admin/sliders");
        }

        res.render("admin/hero-slider/edit", {
            title: "Edit Hero Slider",
            slider
        });

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to load slider.");
        res.redirect("/admin/sliders");
    }
};

exports.update = async (req, res) => {
    try {
        const slider = await HeroSlider.getById(req.params.id);

        if (!slider) {
            req.flash("error", "Slider not found.");
            return res.redirect("/admin/sliders");
        }

        let image = slider.image;

        if (req.file) {

            if (slider.image) {
                const oldImage = path.join(
                    __dirname,
                    "../public/uploads/sliders",
                    slider.image
                );

                if (fs.existsSync(oldImage)) {
                    fs.unlinkSync(oldImage);
                }
            }

            image = req.file.filename;
        }

        await HeroSlider.update(req.params.id, {
            title: req.body.title,
            subtitle: req.body.subtitle,
            button_text: req.body.button_text,
            button_link: req.body.button_link,
            image,
            display_order: req.body.display_order,
            status: req.body.status
        });

        req.flash("success", "Hero slider updated successfully.");
        res.redirect("/admin/sliders");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update hero slider.");
        res.redirect("/admin/sliders");
    }
};






exports.delete = async (req, res) => {
    try {
        const slider = await HeroSlider.getById(req.params.id);

        if (!slider) {
            req.flash("error", "Slider not found.");
            return res.redirect("/admin/sliders");
        }

        if (slider.image) {
            const imagePath = path.join(
                __dirname,
                "../public/uploads/sliders",
                slider.image
            );

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await HeroSlider.delete(req.params.id);

        req.flash("success", "Hero slider deleted successfully.");
        res.redirect("/admin/sliders");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to delete hero slider.");
        res.redirect("/admin/sliders");
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const slider = await HeroSlider.getById(req.params.id);

        if (!slider) {
            req.flash("error", "Slider not found.");
            return res.redirect("/admin/sliders");
        }

        const newStatus =
            slider.status === "Active" ? "Inactive" : "Active";

        await HeroSlider.toggleStatus(req.params.id, newStatus);

        req.flash("success", "Slider status updated successfully.");
        res.redirect("/admin/sliders");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update slider status.");
        res.redirect("/admin/sliders");
    }
};




