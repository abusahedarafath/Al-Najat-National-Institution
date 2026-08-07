const fs = require("fs");
const path = require("path");

const SiteSetting = require("../models/SiteSetting");

exports.index = async (req, res) => {

    try {

        const settings = await SiteSetting.get();

        res.render("admin/site-settings/index", {
            title: "Institution Settings",
            settings
        });

    } catch (err) {

        console.error(err);

        req.flash("error", "Unable to load Institution Settings.");

        res.redirect("/admin");

    }

};

exports.update = async (req, res) => {

    try {

        const settings = await SiteSetting.get();

        let logo = settings ? settings.logo : null;
        let favicon = settings ? settings.favicon : null;

        if (req.files?.logo?.length) {

            if (logo) {

                const oldLogo = path.join(
                    __dirname,
                    "../public/uploads/site-settings",
                    logo
                );

                if (fs.existsSync(oldLogo)) {

                    fs.unlinkSync(oldLogo);

                }

            }

            logo = req.files.logo[0].filename;

        }

        if (req.files?.favicon?.length) {

            if (favicon) {

                const oldFavicon = path.join(
                    __dirname,
                    "../public/uploads/site-settings",
                    favicon
                );

                if (fs.existsSync(oldFavicon)) {

                    fs.unlinkSync(oldFavicon);

                }

            }

            favicon = req.files.favicon[0].filename;

        }

        await SiteSetting.update({

            institution_name: req.body.institution_name,

            tagline: req.body.tagline,

            logo,

            favicon

        });

        req.flash("success", "Institution Settings updated successfully.");

        res.redirect("/admin/site-settings");

    } catch (err) {

        console.error(err);

        req.flash("error", "Failed to update Institution Settings.");

        res.redirect("/admin/site-settings");

    }

};
