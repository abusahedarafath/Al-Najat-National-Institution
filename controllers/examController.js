const Exam = require("../models/Exam");
const Class = require("../models/Class");
const AcademicSession = require("../models/AcademicSession");

// ======================================
// Display All Exams
// ======================================

exports.showExams = (req, res) => {

    Exam.getAll((err, exams) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Internal Server Error");

        }

        res.render("admin/exams", {

            title: "Examination Management",
            exams

        });

    });

};

// ======================================
// Add Exam Page
// ======================================

exports.addExamPage = (req, res) => {

    Class.getAll((err, classes) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Internal Server Error");

        }

        AcademicSession.getAll((err, sessions) => {

            if (err) {

                console.error(err);

                return res.status(500).send("Internal Server Error");

            }

            res.render("admin/add-exam", {

                title: "Add Examination",
                classes,
                sessions

            });

        });

    });

};

// ======================================
// Create Exam
// ======================================

exports.createExam = (req, res) => {

    Exam.create(req.body, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Unable to create examination.");

        }

        res.redirect("/admin/exams");

    });

};

// ======================================
// View Exam
// ======================================

exports.viewExam = (req, res) => {

    Exam.getById(req.params.id, (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Internal Server Error");

        }

        if (!result.length) {

            return res.redirect("/admin/exams");

        }

        res.render("admin/exam-details", {

            title: "Exam Details",
            exam: result[0]

        });

    });

};

// ======================================
// Edit Exam Page
// ======================================

exports.editExamPage = (req, res) => {

    Exam.getById(req.params.id, (err, result) => {

        if (err || !result.length) {

            return res.redirect("/admin/exams");

        }

        Class.getAll((err, classes) => {

            if (err) {

                return res.status(500).send("Internal Server Error");

            }

            AcademicSession.getAll((err, sessions) => {

                if (err) {

                    return res.status(500).send("Internal Server Error");

                }

                res.render("admin/edit-exam", {

                    title: "Edit Examination",
                    exam: result[0],
                    classes,
                    sessions

                });

            });

        });

    });

};

// ======================================
// Update Exam
// ======================================

exports.updateExam = (req, res) => {

    Exam.update(req.params.id, req.body, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Unable to update examination.");

        }

        res.redirect("/admin/exams");

    });

};

// ======================================
// Delete Exam
// ======================================

exports.deleteExam = (req, res) => {

    Exam.delete(req.params.id, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Unable to delete examination.");

        }

        res.redirect("/admin/exams");

    });

};
