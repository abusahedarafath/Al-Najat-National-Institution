const RtsePyq = require("../models/RtsePyq");
const RtsePyqCategory = require("../models/RtsePyqCategory");

exports.index = async (req, res) => {
    try {
        const categoryId = req.query.category_id
            ? Number.parseInt(req.query.category_id, 10)
            : null;

        /*
         * The PYQ admin system has a strict two-level hierarchy:
         *
         * /admin/rtse/pyq/categories
         *      -> year category home
         *
         * /admin/rtse/pyq?category_id=ID
         *      -> PYQs inside one selected year
         *
         * Never show the global/all-PYQs listing here.
         */
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.redirect("/admin/rtse/pyq/categories");
        }

        const category = await RtsePyqCategory.getById(categoryId);

        if (!category) {
            req.flash("error", "PYQ category not found.");
            return res.redirect("/admin/rtse/pyq/categories");
        }

        const pyqs = await RtsePyq.getByCategory(categoryId, true);

        return res.render("admin/rtse/pyq/index", {
            title: `${category.year} PYQ Management`,
            pyqs,
            category,
            categoryId
        });
    } catch (err) {
        console.error("RTSE PYQ admin index error:", err);
        req.flash("error", "Unable to load PYQ management.");
        return res.redirect("/admin/rtse/pyq/categories");
    }
};

exports.createPage = async (req, res) => {
    try {
        const categoryId = req.query.category_id
            ? Number.parseInt(req.query.category_id, 10)
            : null;

        let category = null;

        if (Number.isInteger(categoryId) && categoryId > 0) {
            category = await RtsePyqCategory.getById(categoryId);

            if (!category) {
                req.flash("error", "PYQ category not found.");
                return res.redirect("/admin/rtse/pyq/categories");
            }
        }

        const categories = await RtsePyqCategory.getAll(true);

        return res.render("admin/rtse/pyq/create", {
            title: category
                ? `Add ${category.year} PYQ`
                : "Add RTSE PYQ",
            categories,
            category,
            categoryId
        });
    } catch (err) {
        console.error("RTSE PYQ create page error:", err);
        req.flash("error", "Unable to load PYQ form.");
        return res.redirect("/admin/rtse/pyq");
    }
};

exports.store = async (req, res) => {
    try {
        if (!req.file) {
            req.flash("error", "Please upload a PDF file.");
            return res.redirect("/admin/rtse/pyq/create");
        }

        const year = Number.parseInt(req.body.year, 10);
        const displayOrder = Number.parseInt(req.body.display_order, 10);
        const categoryId = Number.parseInt(req.body.category_id, 10);

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            req.flash("error", "Please enter a valid year.");
            return res.redirect(
                req.body.category_id
                    ? `/admin/rtse/pyq/create?category_id=${req.body.category_id}`
                    : "/admin/rtse/pyq/create"
            );
        }

        if (Number.isInteger(categoryId) && categoryId > 0) {
            const category = await RtsePyqCategory.getById(categoryId);

            if (!category) {
                req.flash("error", "Selected PYQ category was not found.");
                return res.redirect("/admin/rtse/pyq/categories");
            }
        }

        if (!req.body.class_name || !req.body.class_name.trim()) {
            req.flash("error", "Please enter the class.");
            return res.redirect("/admin/rtse/pyq/create");
        }

        await RtsePyq.create({
            category_id: Number.isInteger(categoryId) && categoryId > 0
                ? categoryId
                : null,
            year,
            class_name: req.body.class_name.trim(),
            pdf_path: `/uploads/rtse-pyq/${req.file.filename}`,
            display_order: Number.isInteger(displayOrder) ? displayOrder : 0,
            is_active: req.body.is_active === "1" ? 1 : 0
        });

        req.flash("success", "PYQ added successfully.");

        if (Number.isInteger(categoryId) && categoryId > 0) {
            return res.redirect(
                `/admin/rtse/pyq?category_id=${categoryId}`
            );
        }

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

        const categories = await RtsePyqCategory.getAll(true);

        return res.render("admin/rtse/pyq/edit", {
            title: "Edit RTSE PYQ",
            pyq,
            categories
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
        const categoryId = Number.parseInt(req.body.category_id, 10);

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            req.flash("error", "Please enter a valid year.");
            return res.redirect(`/admin/rtse/pyq/${req.params.id}/edit`);
        }

        if (!req.body.class_name || !req.body.class_name.trim()) {
            req.flash("error", "Please enter the class.");
            return res.redirect(`/admin/rtse/pyq/${req.params.id}/edit`);
        }

        if (Number.isInteger(categoryId) && categoryId > 0) {
            const category = await RtsePyqCategory.getById(categoryId);

            if (!category) {
                req.flash("error", "Selected PYQ category was not found.");
                return res.redirect(`/admin/rtse/pyq/${req.params.id}/edit`);
            }
        }

        /*
         * Existing PYQ files are intentionally never deleted.
         * If a new PDF is uploaded, the database simply points to it.
         */
        const pdfPath = req.file
            ? `/uploads/rtse-pyq/${req.file.filename}`
            : pyq.pdf_path;

        await RtsePyq.update(req.params.id, {
            category_id: Number.isInteger(categoryId) && categoryId > 0
                ? categoryId
                : null,
            year,
            class_name: req.body.class_name.trim(),
            pdf_path: pdfPath,
            display_order: Number.isInteger(displayOrder) ? displayOrder : 0,
            is_active: req.body.is_active === "1" ? 1 : 0
        });

        req.flash("success", "PYQ updated successfully.");

        if (Number.isInteger(categoryId) && categoryId > 0) {
            return res.redirect(
                `/admin/rtse/pyq?category_id=${categoryId}`
            );
        }

        return res.redirect("/admin/rtse/pyq");
    } catch (err) {
        console.error("RTSE PYQ update error:", err);
        req.flash("error", "Failed to update PYQ.");
        return res.redirect("/admin/rtse/pyq");
    }
};

exports.toggle = async (req, res) => {
    try {
        const pyq = await RtsePyq.getById(req.params.id);

        if (!pyq) {
            req.flash("error", "PYQ not found.");
            return res.redirect("/admin/rtse/pyq/categories");
        }

        await RtsePyq.toggle(req.params.id);
        req.flash("success", "PYQ status updated.");

        if (pyq.category_id) {
            return res.redirect(
                `/admin/rtse/pyq?category_id=${pyq.category_id}`
            );
        }

        return res.redirect("/admin/rtse/pyq/categories");
    } catch (err) {
        console.error("RTSE PYQ toggle error:", err);
        req.flash("error", "Failed to update PYQ status.");
        return res.redirect("/admin/rtse/pyq/categories");
    }
};

exports.delete = async (req, res) => {
    try {
        /*
         * Delete only the database record.
         * Never delete a PDF file from disk.
         */
        const pyq = await RtsePyq.getById(req.params.id);

        if (!pyq) {
            req.flash("error", "PYQ not found.");
            return res.redirect("/admin/rtse/pyq/categories");
        }

        const categoryId = pyq.category_id;

        await RtsePyq.delete(req.params.id);
        req.flash("success", "PYQ removed from the listing. The PDF file was preserved.");

        if (categoryId) {
            return res.redirect(
                `/admin/rtse/pyq?category_id=${categoryId}`
            );
        }

        return res.redirect("/admin/rtse/pyq/categories");
    } catch (err) {
        console.error("RTSE PYQ delete error:", err);
        req.flash("error", "Failed to remove PYQ.");
        return res.redirect("/admin/rtse/pyq/categories");
    }
};
