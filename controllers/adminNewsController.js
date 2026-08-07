const News = require("../models/News");

exports.index = async (req, res) => {
    try {
        const news = await News.getAll();

        res.render("admin/news/index", {
            news
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load news.");
        res.redirect("/admin");
    }
};

exports.createPage = (req, res) => {
    res.render("admin/news/create");
};




exports.store = async (req, res) => {
    try {
        const data = {
            title: req.body.title,
            description: req.body.description,
            image: req.file ? req.file.filename : "",
            publish_date: req.body.publish_date,
            status: req.body.status
        };

        await News.create(data);

        req.flash("success", "News created successfully.");
        res.redirect("/admin/news");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to create news.");
        res.redirect("/admin/news/create");
    }
};

exports.editPage = async (req, res) => {
    try {
        const news = await News.getById(req.params.id);

        if (!news) {
            req.flash("error", "News not found.");
            return res.redirect("/admin/news");
        }

        res.render("admin/news/edit", {
            news
        });

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to load news.");
        res.redirect("/admin/news");
    }
};

exports.update = async (req, res) => {
    try {
        const oldNews = await News.getById(req.params.id);

        if (!oldNews) {
            req.flash("error", "News not found.");
            return res.redirect("/admin/news");
        }

        const data = {
            title: req.body.title,
            description: req.body.description,
            image: req.file ? req.file.filename : oldNews.image,
            publish_date: req.body.publish_date,
            status: req.body.status
        };

        await News.update(req.params.id, data);

        req.flash("success", "News updated successfully.");
        res.redirect("/admin/news");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update news.");
        res.redirect("/admin/news");
    }
};

exports.delete = async (req, res) => {
    try {
        await News.delete(req.params.id);

        req.flash("success", "News deleted successfully.");
        res.redirect("/admin/news");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to delete news.");
        res.redirect("/admin/news");
    }
};





