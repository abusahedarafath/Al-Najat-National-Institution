const Subject = require("../models/Subject");

// =======================================
// Show All Subjects
// =======================================

exports.showSubjects = async (req, res) => {
    try {

        const subjects = await Subject.getAll();

        res.render("admin/subjects", {
            title: "Subject Management",
            subjects
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// View Subject
// =======================================

exports.viewSubject = async (req, res) => {
    try {

        const subject = await Subject.getById(req.params.id);

        if (!subject) {
            return res.status(404).send("Subject not found");
        }

        res.render("admin/subject-details", {
            subject
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Add Subject Page
// =======================================

exports.addSubjectPage = (req, res) => {

    res.render("admin/add-subject");

};

// =======================================
// Create Subject
// =======================================

exports.createSubject = async (req, res) => {
    try {

        const subjectData = {

            subject_name: req.body.subject_name,
            subject_code: req.body.subject_code,
            class_name: req.body.class_name,
            teacher_name: req.body.teacher_name,
            subject_type: req.body.subject_type,
            sort_order: req.body.sort_order,
            status: req.body.status || "Active"

        };

        await Subject.create(subjectData);

        res.redirect("/admin/subjects");

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Edit Subject Page
// =======================================

exports.editSubjectPage = async (req, res) => {
    try {

        const subject = await Subject.getById(req.params.id);

        if (!subject) {
            return res.status(404).send("Subject not found");
        }

        res.render("admin/edit-subject", {
            subject
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Update Subject
// =======================================

exports.updateSubject = async (req, res) => {
    try {

        const id = req.params.id;

        const subjectData = {

            subject_name: req.body.subject_name,
            subject_code: req.body.subject_code,
            class_name: req.body.class_name,
            teacher_name: req.body.teacher_name,
            subject_type: req.body.subject_type,
            sort_order: req.body.sort_order,
            status: req.body.status

        };

        await Subject.update(id, subjectData);

        res.redirect("/admin/subject/" + id);

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Delete Subject
// =======================================

exports.deleteSubject = async (req, res) => {
    try {

        await Subject.delete(req.params.id);

        res.redirect("/admin/subjects");

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};
