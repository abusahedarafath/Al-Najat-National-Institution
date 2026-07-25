const fs = require("fs");
const path = require("path");

const HeroSlider = require("../models/HeroSlider");

// ==========================
// Show All Sliders
// ==========================
exports.index = (req, res) => {

    HeroSlider.getAll((err, sliders) => {

        if (err) {
            console.log(err);
            return res.redirect("/admin");
        }

        res.render("admin/hero-slider/index", {
            title: "Hero Sliders",
            sliders
        });

    });

};

// ==========================
// Add Slider Page
// ==========================
exports.createPage = (req, res) => {

    res.render("admin/hero-slider/create", {
        title: "Add Hero Slider"
    });

};

// ==========================
// Save Slider
// ==========================
exports.store = (req, res) => {

    const image = req.file ? req.file.filename : "";

    const data = {
        title: req.body.title,
        subtitle: req.body.subtitle,
        button_text: req.body.button_text,
        button_link: req.body.button_link,
        image,
        display_order: req.body.display_order || 1,
        status: req.body.status || "Active"
    };

    HeroSlider.create(data, (err) => {

        if (err) {
            console.log(err);
            return res.redirect("/admin/sliders/create");
        }

        res.redirect("/admin/sliders");

    });

};

// ==========================
// Edit Slider Page
// ==========================
exports.editPage = (req, res) => {

    HeroSlider.getById(req.params.id, (err, result) => {

        if (err || result.length === 0) {
            return res.redirect("/admin/sliders");
        }

        res.render("admin/hero-slider/edit", {
            title: "Edit Hero Slider",
            slider: result[0]
        });

    });

};

// ==========================
// Update Slider
// ==========================
exports.update = (req, res) => {

    HeroSlider.getById(req.params.id, (err, result) => {

        if (err || result.length === 0) {
            return res.redirect("/admin/sliders");
        }

        const slider = result[0];

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

        const data = {
            title: req.body.title,
            subtitle: req.body.subtitle,
            button_text: req.body.button_text,
            button_link: req.body.button_link,
            image,
            display_order: req.body.display_order,
            status: req.body.status
        };

        HeroSlider.update(req.params.id, data, (err) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/admin/sliders");

        });

    });

};

// ==========================
// Delete Slider
// ==========================
exports.delete = (req, res) => {

    HeroSlider.getById(req.params.id, (err, result) => {

        if (err || result.length === 0) {
            return res.redirect("/admin/sliders");
        }

        const slider = result[0];

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

        HeroSlider.delete(req.params.id, () => {

            res.redirect("/admin/sliders");

        });

    });

};

// ==========================
// Toggle Status
// ==========================
exports.toggleStatus = (req, res) => {

    HeroSlider.getById(req.params.id, (err, result) => {

        if (err || result.length === 0) {
            return res.redirect("/admin/sliders");
        }

        const current = result[0].status;

        const newStatus =
            current === "Active"
                ? "Inactive"
                : "Active";

        HeroSlider.toggleStatus(
            req.params.id,
            newStatus,
            () => {

                res.redirect("/admin/sliders");

            }
        );

    });

};
