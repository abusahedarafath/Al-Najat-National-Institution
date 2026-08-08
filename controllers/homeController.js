const HeroSlider = require("../models/HeroSlider");
const Notice = require("../models/Notice");
const News = require("../models/News");
const ChairmanMessage = require("../models/ChairmanMessage");
const WelcomeSection = require("../models/WelcomeSection");
const PrincipalMessage = require("../models/PrincipalMessage");
const ChancellorMessage = require("../models/ChancellorMessage");

const QuickButton = require("../models/QuickButton");
const SiteSetting = require("../models/SiteSetting");
const Menu = require("../models/Menu");
const personalityModel = require("../models/personalityModel");

const HonourHeartAwardee = require("../models/HonourHeartAwardee");
const HomepageAchievement =
    require("../models/HomepageAchievement");

const HomepageFeature =
    require("../models/HomepageFeature");

// ======================================
// Home Page
// ======================================

exports.index = async (req, res) => {
    try {

        const sliders = await HeroSlider.getActive();
        const notices = await Notice.getLatest(5);
        const news = await News.getLatest(5);

        const chairmanResult = await ChairmanMessage.get();

        const chairman =
            chairmanResult && chairmanResult.length > 0
                ? chairmanResult[0]
                : null;

        const principalResult =
            await PrincipalMessage.get();

        const principal =
            principalResult && principalResult.length > 0
                ? principalResult[0]
                : null;

        const chancellorResult =
            await ChancellorMessage.get();

        const chancellor =
            chancellorResult && chancellorResult.length > 0
                ? chancellorResult[0]
                : null;

        const welcome =
            await WelcomeSection.getActive();

        const quickButtons =
            await QuickButton.getActive();

        const siteSettings =
            await SiteSetting.get();

        const achievements =
            await HomepageAchievement.getActive();

        const features =
            await HomepageFeature.getActive();

        const personalities =
            await personalityModel.getHomepage();

        const honourHeartPopup =
            await HonourHeartAwardee.getPopup();

        res.render(
            "home/index",
            {
                title:
                    "Home | Al-Najat National Institution",

                sliders,
                notices,
                news,

                chairman,
                principal,
                chancellor,

                personalities,
                siteSettings,
                welcome,
                quickButtons,

                honourHeartPopup,

                achievements,
                features
            }
        );

    } catch (err) {

        console.error(
            "Home Controller Error:",
            err
        );

        res.status(500)
            .send("Internal Server Error");
    }
};

// ======================================
// Chairman Message Page
// ======================================
exports.chairmanMessage = async (req, res) => {
    try {
        const result = await ChairmanMessage.get();

        if (!result || result.length === 0) {
            return res.status(404).send("Chairman's message not found.");
        }

        res.render("home/chairman-message", {
            title: "Chairman's Message",
            chairman: result[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// ======================================
// Principal Message Page
// ======================================
exports.principalMessage = async (req, res) => {
    try {
        const result = await PrincipalMessage.get();

        if (!result || result.length === 0) {
            return res.status(404).send("Principal message not found.");
        }

        res.render("home/principal-message", {
            title: "Principal's Message",
            principal: result[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

// ======================================
// Chancellor Message Page
// ======================================
exports.chancellorMessage = async (req, res) => {
    try {
        const result = await ChancellorMessage.get();

        if (!result || result.length === 0) {
            return res.status(404).send("Chancellor message not found.");
        }

        res.render("home/chancellor-message", {
            title: "Chancellor's Message",
            chancellor: result[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
