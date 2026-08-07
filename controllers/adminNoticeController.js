const Notice = require("../models/Notice");

exports.index = async (req, res) => {
    try {
        const notices = await Notice.getAll();

        res.render("admin/notices/index", {
            notices
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load notices.");
        res.redirect("/admin");
    }
};

exports.createPage = (req, res) => {
    res.render("admin/notices/create", {
        title: "Add Notice"
    });
};



exports.store = async (req, res) => {
    try {
        const data = {
            title: req.body.title,
            description: req.body.description,
            file: req.file ? req.file.filename : "",
            publish_date: req.body.publish_date,
            status: req.body.status
        };

        await Notice.create(data);

        req.flash("success", "Notice created successfully.");
        res.redirect("/admin/notices");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to create notice.");
        res.redirect("/admin/notices/create");
    }
};

exports.editPage = async (req, res) => {
    try {
        const notice = await Notice.getById(req.params.id);

        if (!notice) {
            req.flash("error", "Notice not found.");
            return res.redirect("/admin/notices");
        }

        res.render("admin/notices/edit", {
            title: "Edit Notice",
            notice
        });

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to load notice.");
        res.redirect("/admin/notices");
    }
};

exports.update = async (req, res) => {
    try {
        const oldNotice = await Notice.getById(req.params.id);

        if (!oldNotice) {
            req.flash("error", "Notice not found.");
            return res.redirect("/admin/notices");
        }

        const data = {
            title: req.body.title,
            description: req.body.description,
            file: req.file ? req.file.filename : oldNotice.file,
            publish_date: req.body.publish_date,
            status: req.body.status
        };

        await Notice.update(req.params.id, data);

        req.flash("success", "Notice updated successfully.");
        res.redirect("/admin/notices");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update notice.");
        res.redirect("/admin/notices");
    }
};

exports.delete = async (req, res) => {
    try {
        await Notice.delete(req.params.id);

        req.flash("success", "Notice deleted successfully.");
        res.redirect("/admin/notices");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to delete notice.");
        res.redirect("/admin/notices");
    }
};




