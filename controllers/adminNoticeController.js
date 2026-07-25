const Notice = require("../models/Notice");

/**
 * Show All Notices
 */
exports.index = (req, res) => {

    Notice.getAll((err, notices) => {

        if (err) {
            console.error(err);
            return res.redirect("/admin");
        }

        res.render("admin/notices/index", {
            notices
        });

    });

};;
/**
 * Show Create Form
 */
exports.createPage = (req, res) => {

    res.render("admin/notices/create", {
        title: "Add Notice"
    });

};


/**
 * Save Notice
 */
exports.store = (req, res) => {

    const data = {
        title: req.body.title,
        description: req.body.description,
        file: req.file ? req.file.filename : "",
        publish_date: req.body.publish_date,
        status: req.body.status
    };

    Notice.create(data, (err) => {

        if (err) {
            console.error(err);
            return res.redirect("/admin/notices/create");
        }

        res.redirect("/admin/notices");

    });

};


/**
 * Show Edit Form
 */
exports.editPage = (req, res) => {

    Notice.getById(req.params.id, (err, result) => {

        if (err || result.length === 0) {
            return res.redirect("/admin/notices");
        }

        res.render("admin/notices/edit", {
            title: "Edit Notice",
            notice: result[0]
        });

    });

};


/**
 * Update Notice
 */
exports.update = (req, res) => {

    Notice.getById(req.params.id, (err, result) => {

        if (err || result.length === 0) {
            return res.redirect("/admin/notices");
        }

        const oldNotice = result[0];

        const data = {

            title: req.body.title,

            description: req.body.description,

            file: req.file
                ? req.file.filename
                : oldNotice.file,

            publish_date: req.body.publish_date,

            status: req.body.status

        };

        Notice.update(req.params.id, data, (err) => {

            if (err) {
                console.error(err);
            }

            res.redirect("/admin/notices");

        });

    });

};


/**
 * Delete Notice
 */
exports.delete = (req, res) => {

    Notice.delete(req.params.id, (err) => {

        if (err) {
            console.error(err);
        }

        res.redirect("/admin/notices");

    });

};
