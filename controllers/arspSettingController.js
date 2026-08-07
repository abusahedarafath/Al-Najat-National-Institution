const ArspSetting = require("../models/ArspSetting");

// ==========================
// Settings Page
// ==========================

exports.settingsPage = async (req, res) => {

    try {

        const setting = await ArspSetting.get();

        res.render(

            "admin/arsp/settings",

            {

                title: "ARSP Settings",

                setting

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load ARSP Settings."

        );

        res.redirect("/admin/arsp");

    }

};

// ==========================
// Save Settings
// ==========================

exports.updateSettings = async (req, res) => {

    try {



        const data = {

    ...req.body,

    logo:
        req.files &&
        req.files.logo
            ? req.files.logo[0].filename
            : req.body.old_logo,

    favicon:
        req.files &&
        req.files.favicon
            ? req.files.favicon[0].filename
            : req.body.old_favicon,

    president_signature:
        req.files &&
        req.files.president_signature
            ? req.files.president_signature[0].filename
            : req.body.old_president_signature,

    official_seal:
        req.files &&
        req.files.official_seal
            ? req.files.official_seal[0].filename
            : req.body.old_official_seal

};

        await ArspSetting.update(data);

        req.flash(

            "success",

            "ARSP Settings updated successfully."

        );

        res.redirect("/admin/arsp/settings");

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Failed to update settings."

        );

        res.redirect("/admin/arsp/settings");

    }

};
