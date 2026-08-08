const HomepageAchievement =
    require("../models/HomepageAchievement");

// =====================================
// List Achievements
// =====================================

exports.index = async (req, res) => {

    try {

        const achievements =
            await HomepageAchievement.getAll();

        res.render(
            "admin/homepage/achievements/index",
            {
                title: "Our Achievements",
                achievements
            }
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load achievements."
        );

        res.redirect("/admin");

    }

};


// =====================================
// Add Achievement Page
// =====================================

exports.createPage = (req, res) => {

    res.render(
        "admin/homepage/achievements/create",
        {
            title: "Add Achievement"
        }
    );

};


// =====================================
// Create Achievement
// =====================================

exports.create = async (req, res) => {

    try {

        await HomepageAchievement.create({

            title: req.body.title,

            value: req.body.value,

            description:
                req.body.description,

            display_order:
                Number(req.body.display_order) || 0,

            is_active:
                req.body.is_active ? 1 : 0

        });

        req.flash(
            "success",
            "Achievement added successfully."
        );

        res.redirect(
            "/admin/homepage/achievements"
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to add achievement."
        );

        res.redirect(
            "/admin/homepage/achievements/create"
        );

    }

};


// =====================================
// Edit Achievement Page
// =====================================

exports.editPage = async (req, res) => {

    try {

        const achievement =
            await HomepageAchievement.getById(
                req.params.id
            );

        if (!achievement) {

            req.flash(
                "error",
                "Achievement not found."
            );

            return res.redirect(
                "/admin/homepage/achievements"
            );

        }

        res.render(
            "admin/homepage/achievements/edit",
            {
                title: "Edit Achievement",
                achievement
            }
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load achievement."
        );

        res.redirect(
            "/admin/homepage/achievements"
        );

    }

};


// =====================================
// Update Achievement
// =====================================

exports.update = async (req, res) => {

    try {

        await HomepageAchievement.update(

            req.params.id,

            {

                title: req.body.title,

                value: req.body.value,

                description:
                    req.body.description,

                display_order:
                    Number(req.body.display_order) || 0,

                is_active:
                    req.body.is_active ? 1 : 0

            }

        );

        req.flash(
            "success",
            "Achievement updated successfully."
        );

        res.redirect(
            "/admin/homepage/achievements"
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to update achievement."
        );

        res.redirect(
            `/admin/homepage/achievements/${req.params.id}/edit`
        );

    }

};


// =====================================
// Delete Achievement
// =====================================

exports.delete = async (req, res) => {

    try {

        await HomepageAchievement.delete(
            req.params.id
        );

        req.flash(
            "success",
            "Achievement deleted successfully."
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to delete achievement."
        );

    }

    res.redirect(
        "/admin/homepage/achievements"
    );

};
