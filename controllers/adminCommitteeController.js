const ArspCommittee = require("../models/ArspCommittee");

// =====================================
// Committee List
// =====================================

exports.index = async (req, res) => {

    try {

        const committees =
            await ArspCommittee.getAll();

        res.render(
            "admin/arsp/committees/index",
            {
                title: "Committee Management",
                committees
            }
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load committees."
        );

        res.redirect("/admin/arsp");

    }

};


// =====================================
// Create Page
// =====================================

exports.createPage = (req, res) => {

    res.render(
        "admin/arsp/committees/create",
        {
            title: "Create Committee"
        }
    );

};


// =====================================
// Store Committee
// =====================================

exports.store = async (req, res) => {

    try {

        await ArspCommittee.create({

            committee_name:
                req.body.committee_name,

            session_name:
                req.body.session_name,

            start_date:
                req.body.start_date,

            end_date:
                req.body.end_date,

            status:
                req.body.status

        });

        req.flash(
            "success",
            "Committee created successfully."
        );

        res.redirect("/admin/arsp/committees");

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Failed to create committee."
        );

        res.redirect("/admin/arsp/committees/create");

    }

};


// =====================================
// Edit Page
// =====================================

exports.editPage = async (req, res) => {

    try {

        const committee =
            await ArspCommittee.getById(req.params.id);

        if (!committee) {

            req.flash(
                "error",
                "Committee not found."
            );

            return res.redirect(
                "/admin/arsp/committees"
            );

        }

        res.render(
            "admin/arsp/committees/edit",
            {
                title: "Edit Committee",
                committee
            }
        );

    } catch (err) {

        console.error(err);

        res.redirect("/admin/arsp/committees");

    }

};


// =====================================
// Update Committee
// =====================================

exports.update = async (req, res) => {

    try {

        await ArspCommittee.update(

            req.params.id,

            {

                committee_name:
                    req.body.committee_name,

                session_name:
                    req.body.session_name,

                start_date:
                    req.body.start_date,

                end_date:
                    req.body.end_date,

                status:
                    req.body.status

            }

        );

        req.flash(
            "success",
            "Committee updated."
        );

        res.redirect("/admin/arsp/committees");

    } catch (err) {

        console.error(err);

        res.redirect("/admin/arsp/committees");

    }

};




// =====================================
// Delete Committee
// =====================================

exports.delete = async (req, res) => {

    try {

        await ArspCommittee.delete(req.params.id);

        req.flash(
            "success",
            "Committee deleted."
        );

        res.redirect("/admin/arsp/committees");

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Failed to delete committee."
        );

        res.redirect("/admin/arsp/committees");

    }

};
