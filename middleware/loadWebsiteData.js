const Menu = require("../models/Menu");
const SiteSetting = require("../models/SiteSetting");
const ArspSetting = require("../models/ArspSetting");
const FooterSetting = require("../models/FooterSetting");
const FooterLink = require("../models/FooterLink");
const FooterSocialLink = require("../models/FooterSocialLink");
const News = require("../models/News");
const HeaderButton = require("../models/HeaderButton");

module.exports = async (req, res, next) => {

    // =====================================
    // Default Global Website Data
    // =====================================

    res.locals.menus = [];
    res.locals.siteSettings = {};
    res.locals.arspSettings = {};
    res.locals.footerSettings = {};
    res.locals.footerLinks = [];
res.locals.footerSocialLinks = [];
    res.locals.latestNews = [];
    res.locals.headerButtons = [];


    // =====================================
    // Website Menu
    // =====================================

    try {

        res.locals.menus =
            await Menu.getActive();

    } catch (err) {

        console.error(
            "Menu Load Error:",
            err
        );

    }


    // =====================================
    // Website Settings
    // =====================================

    try {

        res.locals.siteSettings =
            await SiteSetting.get();

    } catch (err) {

        console.error(
            "Site Settings Error:",
            err
        );

    }


    // =====================================
    // ARSP Settings
    // =====================================

    try {

        res.locals.arspSettings =
            await ArspSetting.get();

    } catch (err) {

        console.error(
            "ARSP Settings Error:",
            err
        );

    }


    // =====================================
    // Footer Settings
    // =====================================

    try {

        res.locals.footerSettings =
            await FooterSetting.get();

    } catch (err) {

        console.error(
            "Footer Settings Error:",
            err
        );

    }


    // =====================================
    // Footer Links
    // =====================================

    try {

        res.locals.footerLinks =
            await FooterLink.getAll();

    } catch (err) {

        console.error(
            "Footer Links Error:",
            err
        );

    }


    // =====================================
    // Footer Social Links
    // =====================================
    try {
        res.locals.footerSocialLinks =
            await FooterSocialLink.getAll();
    } catch (err) {
        console.error(
            "Footer Social Links Error:",
            err
        );
    }

    // =====================================
    // Header Buttons
    // =====================================
    try {
        res.locals.headerButtons = await HeaderButton.getActive();
    } catch (err) {
        console.error(
            "Header Buttons Load Error:",
            err
        );
        res.locals.headerButtons = [];
    }

    // =====================================
    // Latest Published News
    // =====================================

    try {

        res.locals.latestNews =
            await News.getLatest(3);

    } catch (err) {

        console.error(
            "Latest News Load Error:",
            err
        );

    }


    next();

};
