const HomePopup = require("../models/HomePopup");

function parseForm(req) {
    const buttons = [];

    const labels = Array.isArray(req.body.button_label)
        ? req.body.button_label
        : (req.body.button_label ? [req.body.button_label] : []);

    const urls = Array.isArray(req.body.button_url)
        ? req.body.button_url
        : (req.body.button_url ? [req.body.button_url] : []);

    const colors = Array.isArray(req.body.button_color)
        ? req.body.button_color
        : (req.body.button_color ? [req.body.button_color] : []);

    const targets = Array.isArray(req.body.button_target)
        ? req.body.button_target
        : (req.body.button_target ? [req.body.button_target] : []);

    const count = Math.max(labels.length, urls.length);

    for (let i = 0; i < count; i++) {
        const label = (labels[i] || "").trim();
        const url = (urls[i] || "").trim();

        if (!label || !url) continue;

        buttons.push({
            label,
            url,
            color: (colors[i] || "primary").trim(),
            target: targets[i] === "_blank" ? "_blank" : "_self"
        });
    }

    return {
        title: (req.body.title || "").trim(),
        message: (req.body.message || "").trim(),
        buttons,
        status: req.body.status === "Active" ? "Active" : "Inactive",
        start_at: req.body.start_at || null,
        end_at: req.body.end_at || null,
        display_frequency: ["always", "session", "daily"].includes(req.body.display_frequency)
            ? req.body.display_frequency
            : "always"
    };
}

exports.index = async (req, res) => {
    try {
        const popups = await HomePopup.getAll();

        res.render("admin/home-popups", {
            title: "Home Page Popups",
            popups
        });
    } catch (err) {
        console.error("Home Popups Load Error:", err);
        req.flash("error", "Unable to load Home Page Popups.");
        res.redirect("/admin");
    }
};

exports.addPage = (req, res) => {
    res.render("admin/add-home-popup", {
        title: "Add Home Page Popup",
        popup: null
    });
};

exports.create = async (req, res) => {
    try {
        const data = parseForm(req);

        if (!data.title || !data.message) {
            req.flash("error", "Title and message are required.");
            return res.redirect("/admin/home-popups/add");
        }

        await HomePopup.create(data);

        req.flash("success", "Home Page Popup added successfully.");
        res.redirect("/admin/home-popups");
    } catch (err) {
        console.error("Home Popup Create Error:", err);
        req.flash("error", "Failed to add Home Page Popup.");
        res.redirect("/admin/home-popups/add");
    }
};

exports.editPage = async (req, res) => {
    try {
        const popup = await HomePopup.getById(req.params.id);

        if (!popup) {
            req.flash("error", "Home Page Popup not found.");
            return res.redirect("/admin/home-popups");
        }

        res.render("admin/add-home-popup", {
            title: "Edit Home Page Popup",
            popup
        });
    } catch (err) {
        console.error("Home Popup Edit Load Error:", err);
        req.flash("error", "Unable to load Home Page Popup.");
        res.redirect("/admin/home-popups");
    }
};

exports.update = async (req, res) => {
    try {
        const data = parseForm(req);

        if (!data.title || !data.message) {
            req.flash("error", "Title and message are required.");
            return res.redirect(`/admin/home-popups/${req.params.id}/edit`);
        }

        await HomePopup.update(req.params.id, data);

        req.flash("success", "Home Page Popup updated successfully.");
        res.redirect("/admin/home-popups");
    } catch (err) {
        console.error("Home Popup Update Error:", err);
        req.flash("error", "Failed to update Home Page Popup.");
        res.redirect(`/admin/home-popups/${req.params.id}/edit`);
    }
};

exports.toggle = async (req, res) => {
    try {
        await HomePopup.toggle(req.params.id);
        req.flash("success", "Home Page Popup status updated.");
    } catch (err) {
        console.error("Home Popup Toggle Error:", err);
        req.flash("error", "Failed to update popup status.");
    }

    res.redirect("/admin/home-popups");
};

exports.delete = async (req, res) => {
    try {
        await HomePopup.delete(req.params.id);
        req.flash("success", "Home Page Popup deleted successfully.");
    } catch (err) {
        console.error("Home Popup Delete Error:", err);
        req.flash("error", "Failed to delete Home Page Popup.");
    }

    res.redirect("/admin/home-popups");
};
