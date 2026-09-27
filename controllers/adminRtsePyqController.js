const RtsePyq = require("../models/RtsePyq");

exports.index = async (req, res) => {
    try {
        const pyqs = await RtsePyq.getAll(true);

        return res.render("admin/rtse/pyq/index", {
            title: "RTSE PYQ Management",
            pyqs
        });
    } catch (err) {
        console.error("RTSE PYQ admin index error:", err);
        req.flash("error", "Unable to load PYQ management.");
        return res.redirect("/admin/rtse");
    }
};

exports.createPage = (req, res) => {
    return res.render("admin/rtse/pyq/create", {
        title: "Add RTSE PYQ"
    });
};

exports.store = async (req, res) => {
    try {
        if (!req.file) {
            req.flash("error", "Please upload a PDF file.");
            return res.redirect("/admin/rtse/pyq/create");
        }

        const year = Number.parseInt(req.body.year, 10);
        const displayOrder = Number.parseInt(req.body.display_order, 10);

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            req.flash("error", "Please enter a valid year.");
            return res.redirect("/admin/rtse/pyq/create");
        }

        if (!req.body.class_name || !req.body.class_name.trim()) {
            req.flash("error", "Please enter the class.");
            return res.redirect("/admin/rtse/pyq/create");
        }

        await RtsePyq.create({
            year,
            class_name: req.body.class_name.trim(),
            pdf_path: `/uploads/rtse-pyq/${req.file.filename}`,
            display_order: Number.isInteger(displayOrder) ? displayOrder : 0,
            is_active: req.body.is_active === "1" ? 1 : 0
        });

        req.flash("success", "PYQ added successfully.");
        return res.redirect("/admin/rtse/pyq");
    } catch (err) {
        console.error("RTSE PYQ create error:", err);
        req.flash("error", "Failed to add PYQ.");
        return res.redirect("/admin/rtse/pyq/create");
    }
};

exports.editPage = async (req, res) => {
    try {
        const pyq = await RtsePyq.getById(req.params.id);

        if (!pyq) {
            req.flash("error", "PYQ not found.");
            return res.redirect("/admin/rtse/pyq");
        }

        return res.render("admin/rtse/pyq/edit", {
            title: "Edit RTSE PYQ",
            pyq
        });
    } catch (err) {
        console.error("RTSE PYQ edit page error:", err);
        req.flash("error", "Unable to load PYQ.");
        return res.redirect("/admin/rtse/pyq");
    }
};

exports.update = async (req, res) => {
    try {
        const pyq = await RtsePyq.getById(req.params.id);

        if (!pyq) {
            req.flash("error", "PYQ not found.");
            return res.redirect("/admin/rtse/pyq");
        }

        const year = Number.parseInt(req.body.year, 10);
        const displayOrder = Number.parseInt(req.body.display_order, 10);

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            req.flash("error", "Please enter a valid year.");
            return res.redirect(`/admin/rtse/pyq/${req.params.id}/edit`);
        }

        if (!req.body.class_name || !req.body.class_name.trim()) {
            req.flash("error", "Please enter the class.");
            return res.redirect(`/admin/rtse/pyq/${req.params.id}/edit`);
        }

        /*
         * Existing PYQ files are intentionally never deleted.
         * If a new PDF is uploaded, the database simply points to it.
         */
        const pdfPath = req.file
            ? `/uploads/rtse-pyq/${req.file.filename}`
            : pyq.pdf_path;

        await RtsePyq.update(req.params.id, {
            year,
            class_name: req.body.class_name.trim(),
            pdf_path: pdfPath,
            display_order: Number.isInteger(displayOrder) ? displayOrder : 0,
            is_active: req.body.is_active === "1" ? 1 : 0
        });

        req.flash("success", "PYQ updated successfully.");
        return res.redirect("/admin/rtse/pyq");
    } catch (err) {
        console.error("RTSE PYQ update error:", err);
        req.flash("error", "Failed to update PYQ.");
        return res.redirect("/admin/rtse/pyq");
    }
};

exports.toggle = async (req, res) => {
    try {
        await RtsePyq.toggle(req.params.id);
        req.flash("success", "PYQ status updated.");
    } catch (err) {
        console.error("RTSE PYQ toggle error:", err);
        req.flash("error", "Failed to update PYQ status.");
    }

    return res.redirect("/admin/rtse/pyq");
};

exports.delete = async (req, res) => {
    try {
        /*
         * Delete only the database record.
         * Never delete a PDF file from disk.
         */
        await RtsePyq.delete(req.params.id);
        req.flash("success", "PYQ removed from the listing.");
    } catch (err) {
        console.error("RTSE PYQ delete error:", err);
        req.flash("error", "Failed to remove PYQ.");
    }

    return res.redirect("/admin/rtse/pyq");
};
