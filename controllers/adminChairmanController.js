const fs = require("fs");
const path = require("path");

const ChairmanMessage = require("../models/ChairmanMessage");

exports.index = async (req, res) => {
    try {
        const result = await ChairmanMessage.get();

        res.render("admin/chairman/index", {
            title: "Chairman's Message",
            chairman: result[0]
        });
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to load Chairman's Message.");
        res.redirect("/admin");
    }
};

exports.update = async (req, res) => {
    try {
        const result = await ChairmanMessage.get();

        if (!result.length) {
            req.flash("error", "Chairman's record not found.");
            return res.redirect("/admin/chairman");
        }

        const chairman = result[0];

        let image = chairman.image;

        if (req.file) {
            if (chairman.image) {
                const oldImage = path.join(
                    __dirname,
                    "../public/uploads/chairman",
                    chairman.image
                );

                if (fs.existsSync(oldImage)) {
                    fs.unlinkSync(oldImage);
                }
            }

            image = req.file.filename;
        }

        await ChairmanMessage.update({
            name: req.body.name,
            designation: req.body.designation,
            message: req.body.message,
            image
        });

        req.flash("success", "Chairman's Message updated successfully.");
        res.redirect("/admin/chairman");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update Chairman's Message.");
        res.redirect("/admin/chairman");
    }
};
