const HomepageFeature =
    require("../models/HomepageFeature");

// =====================================
// List Features
// =====================================

exports.index = async (req, res) => {

    try {

        const features =
            await HomepageFeature.getAll();

        res.render(
            "admin/homepage/features/index",
            {
                title: "Why Choose Us",
                features
            }
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load Why Choose Us."
        );

        res.redirect("/admin");

    }

};


// =====================================
// Add Feature Form
// =====================================

exports.createPage = (req, res) => {

    res.render(
        "admin/homepage/features/create",
        {
            title: "Add Why Choose Us"
        }
    );

};


// =====================================
// Create Feature
// =====================================

exports.create = async (req, res) => {

    try {

        await HomepageFeature.create({

            title: req.body.title,

            description: req.body.description,

            icon: req.body.icon,

            display_order:
                Number(req.body.display_order) || 0,

            is_active:
                req.body.is_active ? 1 : 0

        });

        req.flash(
            "success",
            "Why Choose Us item added successfully."
        );

        res.redirect(
            "/admin/homepage/features"
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to add Why Choose Us item."
        );

        res.redirect(
            "/admin/homepage/features/create"
        );

    }

};


// =====================================
// Edit Feature Form
// =====================================

exports.editPage = async (req, res) => {

    try {

        const feature =
            await HomepageFeature.getById(
                req.params.id
            );

        if (!feature) {

            req.flash(
                "error",
                "Feature not found."
            );

            return res.redirect(
                "/admin/homepage/features"
            );

        }

        res.render(
            "admin/homepage/features/edit",
            {
                title: "Edit Why Choose Us",
                feature
            }
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load feature."
        );

        res.redirect(
            "/admin/homepage/features"
        );

    }

};


// =====================================
// Update Feature
// =====================================

exports.update = async (req, res) => {

    try {

        await HomepageFeature.update(

            req.params.id,

            {

                title: req.body.title,

                description:
                    req.body.description,

                icon: req.body.icon,

                display_order:
                    Number(req.body.display_order) || 0,

                is_active:
                    req.body.is_active ? 1 : 0

            }

        );

        req.flash(
            "success",
            "Why Choose Us item updated successfully."
        );

        res.redirect(
            "/admin/homepage/features"
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to update Why Choose Us item."
        );

        res.redirect(
            `/admin/homepage/features/${req.params.id}/edit`
        );

    }

};


// =====================================
// Delete Feature
// =====================================

exports.delete = async (req, res) => {

    try {

        await HomepageFeature.delete(
            req.params.id
        );

        req.flash(
            "success",
            "Why Choose Us item deleted successfully."
        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to delete Why Choose Us item."
        );

    }

    res.redirect(
        "/admin/homepage/features"
    );

};
