const Class = require("../models/Class");

// =======================================
// Show All Classes
// =======================================

exports.showClasses = async (req, res) => {
    try {

        const classes = await Class.getAll();

        res.render("admin/classes", {
            title: "Class Management",
            classes
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// View Class
// =======================================

exports.viewClass = async (req, res) => {
    try {

        const classData = await Class.getById(req.params.id);

        if (!classData) {
            return res.status(404).send("Class not found");
        }

        res.render("admin/class-details", {
            classData
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Add Class Page
// =======================================

exports.addClassPage = (req, res) => {

    res.render("admin/add-class");

};

// =======================================
// Create Class
// =======================================

exports.createClass = async (req, res) => {
    try {

        const classData = {

            class_name: req.body.class_name,
            class_code: req.body.class_code,
            section: req.body.section,
            academic_session: req.body.academic_session,
            class_teacher: req.body.class_teacher,
            capacity: req.body.capacity,
            sort_order: req.body.sort_order,
            status: req.body.status || "Active"

        };

        await Class.create(classData);

        res.redirect("/admin/classes");

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Edit Class Page
// =======================================

exports.editClassPage = async (req, res) => {
    try {

        const classData = await Class.getById(req.params.id);

        if (!classData) {
            return res.status(404).send("Class not found");
        }

        res.render("admin/edit-class", {
            classData
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Update Class
// =======================================

exports.updateClass = async (req, res) => {
    try {

        const id = req.params.id;

        const classData = {

            class_name: req.body.class_name,
            class_code: req.body.class_code,
            section: req.body.section,
            academic_session: req.body.academic_session,
            class_teacher: req.body.class_teacher,
            capacity: req.body.capacity,
            sort_order: req.body.sort_order,
            status: req.body.status

        };

        await Class.update(id, classData);

        res.redirect("/admin/class/" + id);

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Delete Class
// =======================================

exports.deleteClass = async (req, res) => {
    try {

        await Class.delete(req.params.id);

        res.redirect("/admin/classes");

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};
