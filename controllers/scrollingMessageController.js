const ScrollingMessage = require("../models/ScrollingMessage");
const { indiaToUtc, utcToIndia } = require("../utils/indiaDateTime");

exports.index = async (req, res) => {
    try {
        const messages = await ScrollingMessage.getAll();

        res.render("admin/scrolling-messages", {
            title: "Scrolling Messages",
            messages
        });

    } catch (err) {
        console.error("Scrolling Messages Load Error:", err);
        req.flash("error", "Unable to load Scrolling Messages.");
        res.redirect("/admin");
    }
};

exports.addPage = (req, res) => {
    res.render("admin/add-scrolling-message", {
        title: "Add Scrolling Message"
    });
};

exports.create = async (req, res) => {
    try {
        await ScrollingMessage.create({
            message: req.body.message,
            url: req.body.url,
            text_color: req.body.text_color,
            display_order: req.body.display_order,
            status: req.body.status,
            start_date: indiaToUtc(req.body.start_date),
            end_date: indiaToUtc(req.body.end_date)
        });

        req.flash("success", "Scrolling Message added successfully.");
        res.redirect("/admin/scrolling-messages");

    } catch (err) {
        console.error("Scrolling Message Create Error:", err);
        req.flash("error", "Failed to add Scrolling Message.");
        res.redirect("/admin/scrolling-messages/add");
    }
};

exports.editPage = async (req, res) => {
    try {
        const message = await ScrollingMessage.getById(req.params.id);

        if (!message) {
            req.flash("error", "Scrolling Message not found.");
            return res.redirect("/admin/scrolling-messages");
        }

        message.start_date = utcToIndia(message.start_date);
        message.end_date = utcToIndia(message.end_date);

        res.render("admin/edit-scrolling-message", {
            title: "Edit Scrolling Message",
            message
        });

    } catch (err) {
        console.error("Scrolling Message Edit Load Error:", err);
        req.flash("error", "Unable to load Scrolling Message.");
        res.redirect("/admin/scrolling-messages");
    }
};

exports.update = async (req, res) => {
    try {
        await ScrollingMessage.update(req.params.id, {
            message: req.body.message,
            url: req.body.url,
            text_color: req.body.text_color,
            display_order: req.body.display_order,
            status: req.body.status,
            start_date: indiaToUtc(req.body.start_date),
            end_date: indiaToUtc(req.body.end_date)
        });

        req.flash("success", "Scrolling Message updated successfully.");
        res.redirect("/admin/scrolling-messages");

    } catch (err) {
        console.error("Scrolling Message Update Error:", err);
        req.flash("error", "Failed to update Scrolling Message.");
        res.redirect("/admin/scrolling-messages");
    }
};

exports.delete = async (req, res) => {
    try {
        await ScrollingMessage.delete(req.params.id);

        req.flash("success", "Scrolling Message deleted successfully.");
        res.redirect("/admin/scrolling-messages");

    } catch (err) {
        console.error("Scrolling Message Delete Error:", err);
        req.flash("error", "Failed to delete Scrolling Message.");
        res.redirect("/admin/scrolling-messages");
    }
};
