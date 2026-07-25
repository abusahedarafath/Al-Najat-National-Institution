const Notice = require("../models/Notice");
const News = require("../models/News");

// ======================
// All Notices
// ======================
exports.noticeList = (req, res) => {

    Notice.getActive((err, notices) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Server Error");
        }

        res.render("public/notice-list", {
            title: "Notices",
            notices
        });

    });

};

// ======================
// Notice Details
// ======================
exports.noticeDetails = (req, res) => {

    Notice.getById(req.params.id, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Server Error");
        }

        if (!result.length) {
            return res.status(404).send("Notice Not Found");
        }

        res.render("public/notice-details", {
            title: result[0].title,
            notice: result[0]
        });

    });

};

// ======================
// All News
// ======================
exports.newsList = (req, res) => {

    News.getActive((err, news) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Server Error");
        }

        res.render("public/news-list", {
            title: "News",
            news
        });

    });

};

// ======================
// News Details
// ======================
exports.newsDetails = (req, res) => {

    News.getById(req.params.id, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Server Error");
        }

        if (!result.length) {
            return res.status(404).send("News Not Found");
        }

        res.render("public/news-details", {
            title: result[0].title,
            news: result[0]
        });

    });

};
