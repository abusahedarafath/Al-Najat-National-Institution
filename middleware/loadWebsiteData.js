const Menu = require("../models/Menu");
const SiteSetting = require("../models/SiteSetting");
const ArspSetting = require("../models/ArspSetting");

module.exports = async (req, res, next) => {

    res.locals.menus = [];
    res.locals.siteSettings = {};
    res.locals.arspSettings = {};

    // ==========================
    // Website Menu
    // ==========================

    try {

        res.locals.menus = await Menu.getActive();

    } catch (err) {

        console.error("Menu Load Error:", err);

    }

    // ==========================
    // Website Settings
    // ==========================

    try {

        if (
            SiteSetting &&
            typeof SiteSetting.get === "function"
        ) {

            res.locals.siteSettings =
                await SiteSetting.get();

        }

    } catch (err) {

        console.error(
            "Site Settings Error:",
            err
        );

    }

    // ==========================
    // ARSP Settings
    // ==========================

    try {

        if (
            ArspSetting &&
            typeof ArspSetting.get === "function"
        ) {

            res.locals.arspSettings =
                await ArspSetting.get();

        }

    } catch (err) {

        console.error(
            "ARSP Settings Error:",
            err
        );

    }

    next();

};
