const Notice = require("../models/Notice");
const News = require("../models/News");

// ======================
// All Notices
// ======================

exports.noticeList = async (req, res) => {

    try {

        const notices = await Notice.getActive();

        res.render("public/notice-list", {
            title: "Notices",
            notices
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Server Error");

    }

};

// ======================
// Notice Details
// ======================

exports.noticeDetails = async (req, res) => {

    try {

        const notice = await Notice.getById(req.params.id);

        if (!notice) {
            return res.status(404).send("Notice Not Found");
        }

        res.render("public/notice-details", {
            title: notice.title,
            notice
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Server Error");

    }

};

// ======================
// All News
// ======================

exports.newsList = async (req, res) => {

    try {

        const news = await News.getActive();

        res.render("public/news-list", {
            title: "News",
            news
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Server Error");

    }

};

// ======================
// News Details
// ======================

exports.newsDetails = async (req, res) => {

    try {

        const news = await News.getById(req.params.id);

        if (!news) {
            return res.status(404).send("News Not Found");
        }

        res.render("public/news-details", {
            title: news.title,
            news
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Server Error");

    }

};

