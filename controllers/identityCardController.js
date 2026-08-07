const IdentityCardSetting = require("../models/IdentityCardSetting");

exports.settingsPage = async (req, res) => {

    try {

        const settings = await IdentityCardSetting.get();

        res.render("admin/id-card/settings", {

            title: "Identity Card Settings",

            settings

        });

    } catch (err) {

        console.error(err);

        req.flash("error", "Unable to load Identity Card Settings.");

        res.redirect("/admin");

    }

};




exports.saveSettings = async (req, res) => {

    try {

        const data = {

            background: req.files.background
                ? req.files.background[0].filename
                : req.body.old_background,

            qr_enabled: req.body.qr_enabled,

            card_width: req.body.card_width,

            card_height: req.body.card_height

        };

        await IdentityCardSetting.save(data);

        req.flash(
            "success",
            "Identity Card Settings updated successfully."
        );

        res.redirect("/admin/id-card/settings");

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Failed to update Identity Card Settings."
        );

        res.redirect("/admin/id-card/settings");

    }

};
