const News = require("../models/News");

/**
 * List News
 */
exports.index = (req, res) => {

    News.getAll((err, news) => {

        if (err) {
            console.error(err);
            return res.redirect("/admin");
        }

        res.render("admin/news/index", {
            news
        });

    });

};

/**
 * Create Page
 */
exports.createPage = (req, res) => {

    res.render("admin/news/create");

};

/**
 * Store News
 */
exports.store = (req, res) => {

    const data = {

        title: req.body.title,

        description: req.body.description,

        image: req.file ? req.file.filename : "",

        publish_date: req.body.publish_date,

        status: req.body.status

    };

    News.create(data, (err) => {

        if (err) {
            console.error(err);
            return res.redirect("/admin/news/create");
        }

        res.redirect("/admin/news");

    });

};

/**
 * Edit Page
 */
exports.editPage = (req, res) => {

    News.getById(req.params.id, (err, result) => {

        if (err || result.length === 0) {
            return res.redirect("/admin/news");
        }

        res.render("admin/news/edit", {

            news: result[0]

        });

    });

};

/**
 * Update News
 */
exports.update = (req, res) => {

    News.getById(req.params.id, (err, result) => {

        if (err || result.length === 0) {
            return res.redirect("/admin/news");
        }

        const oldNews = result[0];

        const data = {

            title: req.body.title,

            description: req.body.description,

            image: req.file
                ? req.file.filename
                : oldNews.image,

            publish_date: req.body.publish_date,

            status: req.body.status

        };

        News.update(req.params.id, data, (err) => {

            if (err) {
                console.error(err);
            }

            res.redirect("/admin/news");

        });

    });

};

/**
 * Delete News
 */
exports.delete = (req, res) => {

    News.delete(req.params.id, (err) => {

        if (err) {
            console.error(err);
        }

        res.redirect("/admin/news");

    });

};
