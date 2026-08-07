const Mark = require("../models/Mark");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Exam = require("../models/Exam");

// ======================================
// Display All Marks
// ======================================

exports.showMarks = (req, res) => {

    Mark.getAll((err, marks) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Internal Server Error");

        }

        res.render("admin/marks", {

            title: "Marks Management",
            marks

        });

    });

};

// ======================================
// Add Mark Page
// ======================================

exports.addMarkPage = (req, res) => {

    Class.getAll((err, classes) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Internal Server Error");

        }

        Student.getAll((err, students) => {

            if (err) {

                console.error(err);

                return res.status(500).send("Internal Server Error");

            }

            Subject.getAll((err, subjects) => {

                if (err) {

                    console.error(err);

                    return res.status(500).send("Internal Server Error");

                }

                Exam.getAll((err, exams) => {

                    if (err) {

                        console.error(err);

                        return res.status(500).send("Internal Server Error");

                    }

                    res.render("admin/add-mark", {

                        title: "Add Marks",
                        classes,
                        students,
                        subjects,
                        exams

                    });

                });

            });

        });

    });

};

// ======================================
// Create Mark
// ======================================

exports.createMark = (req, res) => {

    Mark.create(req.body, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Unable to save marks.");

        }

        res.redirect("/admin/marks");

    });

};

// ======================================
// View Mark Details
// ======================================

exports.viewMark = (req, res) => {

    Mark.getById(req.params.id, (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Internal Server Error");

        }

        if (!result.length) {

            return res.redirect("/admin/marks");

        }

        res.render("admin/mark-details", {

            title: "Mark Details",
            mark: result[0]

        });

    });

};

// ======================================
// Edit Mark Page
// ======================================

exports.editMarkPage = (req, res) => {

    Mark.getById(req.params.id, (err, result) => {

        if (err || !result.length) {

            return res.redirect("/admin/marks");

        }

        const mark = result[0];

        Class.getAll((err, classes) => {

            if (err) {

                return res.status(500).send("Internal Server Error");

            }

            Student.getAll((err, students) => {

                if (err) {

                    return res.status(500).send("Internal Server Error");

                }

                Subject.getAll((err, subjects) => {

                    if (err) {

                        return res.status(500).send("Internal Server Error");

                    }

                    Exam.getAll((err, exams) => {

                        if (err) {

                            return res.status(500).send("Internal Server Error");

                        }

                        res.render("admin/edit-mark", {

                            title: "Edit Marks",
                            mark,
                            classes,
                            students,
                            subjects,
                            exams

                        });

                    });

                });

            });

        });

    });

};

// ======================================
// Update Mark
// ======================================

exports.updateMark = (req, res) => {

    Mark.update(req.params.id, req.body, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Unable to update marks.");

        }

        res.redirect("/admin/marks");

    });

};

// ======================================
// Delete Mark
// ======================================

exports.deleteMark = (req, res) => {

    Mark.delete(req.params.id, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Unable to delete marks.");

        }

        res.redirect("/admin/marks");

    });

};
