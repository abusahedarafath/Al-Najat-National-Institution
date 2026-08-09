const FooterSetting = require("../models/FooterSetting");
const FooterLink = require("../models/FooterLink");
const FooterSocialLink = require("../models/FooterSocialLink");


// =====================================
// Footer Management Dashboard
// =====================================

exports.index = async (req, res) => {

    try {

        const settings =
            await FooterSetting.get();

        const links =
            await FooterLink.getAll();
            const socialLinks =
                await FooterSocialLink.getAll();

        res.render(
            "admin/footer/index",
            {
                title: "Footer Management",
                settings,
                links,
                socialLinks
            }
        );

    } catch (error) {

        console.error(
            "Footer Management Error:",
            error
        );

        req.flash(
            "error",
            "Unable to load Footer Management."
        );

        res.redirect("/admin");

    }

};


// =====================================
// Update Footer Settings
// =====================================

exports.updateSettings = async (req, res) => {
    try {
        await FooterSetting.update({
            description: req.body.description || "",
            address: req.body.address || "",
            phone: req.body.phone || "",
            email: req.body.email || "",
            whatsapp: req.body.whatsapp || "",
            facebook: req.body.facebook || "",
            instagram: req.body.instagram || "",
            youtube: req.body.youtube || "",
            twitter: req.body.twitter || "",
            telegram: req.body.telegram || "",
            copyright_text: req.body.copyright_text || "",
            developer_text: req.body.developer_text || ""
        });

        req.flash(
            "success",
            "Footer settings updated successfully."
        );

        res.redirect("/admin/footer");

    } catch (error) {
        console.error(
            "Footer Settings Update Error:",
            error
        );

        req.flash(
            "error",
            "Failed to update footer settings."
        );

        res.redirect("/admin/footer");
    }
};


// =====================================
// Add Footer Link
// =====================================

exports.addLink = async (req, res) => {

    try {

        await FooterLink.create({

            section:
                req.body.section,

            title:
                req.body.title,

            url:
                req.body.url,

            sort_order:
                req.body.sort_order || 0,

            is_active:
                req.body.is_active

        });

        req.flash(
            "success",
            "Footer link added successfully."
        );

        res.redirect("/admin/footer");

    } catch (error) {

        console.error(
            "Footer Link Add Error:",
            error
        );

        req.flash(
            "error",
            "Failed to add footer link."
        );

        res.redirect("/admin/footer");

    }

};


// =====================================
// Update Footer Link
// =====================================

exports.updateLink = async (req, res) => {

    try {

        await FooterLink.update(
            req.params.id,
            {

                section:
                    req.body.section,

                title:
                    req.body.title,

                url:
                    req.body.url,

                sort_order:
                    req.body.sort_order || 0,

                is_active:
                    req.body.is_active

            }
        );

        req.flash(
            "success",
            "Footer link updated successfully."
        );

        res.redirect("/admin/footer");

    } catch (error) {

        console.error(
            "Footer Link Update Error:",
            error
        );

        req.flash(
            "error",
            "Failed to update footer link."
        );

        res.redirect("/admin/footer");

    }

};


// =====================================
// Delete Footer Link
// =====================================

exports.deleteLink = async (req, res) => {

    try {

        await FooterLink.delete(
            req.params.id
        );

        req.flash(
            "success",
            "Footer link deleted successfully."
        );

        res.redirect("/admin/footer");

    } catch (error) {

        console.error(
            "Footer Link Delete Error:",
            error
        );

        req.flash(
            "error",
            "Failed to delete footer link."
        );

        res.redirect("/admin/footer");

    }

};


// =====================================
// Add Footer Social Link
// =====================================

exports.addSocialLink = async (req, res) => {
    try {

        await FooterSocialLink.create({
            platform: req.body.platform || "",
            icon_class: req.body.icon_class || "",
            url: req.body.url || "",
            sort_order: req.body.sort_order || 0,
            is_active: req.body.is_active
        });

        req.flash(
            "success",
            "Footer social link added successfully."
        );

        res.redirect("/admin/footer");

    } catch (error) {

        console.error(
            "Footer Social Link Add Error:",
            error
        );

        req.flash(
            "error",
            "Failed to add footer social link."
        );

        res.redirect("/admin/footer");
    }
};


// =====================================
// Update Footer Social Link
// =====================================

exports.updateSocialLink = async (req, res) => {
    try {

        await FooterSocialLink.update(
            req.params.id,
            {
                platform: req.body.platform || "",
                icon_class: req.body.icon_class || "",
                url: req.body.url || "",
                sort_order: req.body.sort_order || 0,
                is_active: req.body.is_active
            }
        );

        req.flash(
            "success",
            "Footer social link updated successfully."
        );

        res.redirect("/admin/footer");

    } catch (error) {

        console.error(
            "Footer Social Link Update Error:",
            error
        );

        req.flash(
            "error",
            "Failed to update footer social link."
        );

        res.redirect("/admin/footer");
    }
};


// =====================================
// Delete Footer Social Link
// =====================================

exports.deleteSocialLink = async (req, res) => {
    try {

        await FooterSocialLink.delete(
            req.params.id
        );

        req.flash(
            "success",
            "Footer social link deleted successfully."
        );

        res.redirect("/admin/footer");

    } catch (error) {

        console.error(
            "Footer Social Link Delete Error:",
            error
        );

        req.flash(
            "error",
            "Failed to delete footer social link."
        );

        res.redirect("/admin/footer");
    }
};
