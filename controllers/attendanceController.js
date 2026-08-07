const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Class = require("../models/Class");

// ===============================
// Attendance Dashboard
// ===============================

exports.showAttendance = (req, res) => {

    Attendance.getAll((err, attendance) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Internal Server Error");

        }

        res.render("admin/attendance", {

            title: "Attendance Management",
            attendance

        });

    });

};

// ===============================
// Add Attendance Page
// ===============================

exports.addAttendancePage = (req, res) => {

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

            res.render("admin/add-attendance", {

                title: "Add Attendance",
                classes,
                students

            });

        });

    });

};

// ===============================
// Save Attendance
// ===============================

exports.createAttendance = (req, res) => {

    Attendance.create(req.body, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Unable to save attendance.");

        }

        res.redirect("/admin/attendance");

    });

};

// ===============================
// Attendance Details
// ===============================

exports.viewAttendance = (req, res) => {

    Attendance.getById(req.params.id, (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Internal Server Error");

        }

        if (!result.length) {

            return res.redirect("/admin/attendance");

        }

        res.render("admin/attendance-details", {

            title: "Attendance Details",
            attendance: result[0]

        });

    });

};

// ===============================
// Edit Attendance Page
// ===============================

exports.editAttendancePage = (req, res) => {

    Attendance.getById(req.params.id, (err, result) => {

        if (err || !result.length) {

            return res.redirect("/admin/attendance");

        }

        Class.getAll((err, classes) => {

            if (err) {

                return res.status(500).send("Internal Server Error");

            }

            Student.getAll((err, students) => {

                if (err) {

                    return res.status(500).send("Internal Server Error");

                }

                res.render("admin/edit-attendance", {

                    title: "Edit Attendance",
                    attendance: result[0],
                    classes,
                    students

                });

            });

        });

    });

};

// ===============================
// Update Attendance
// ===============================

exports.updateAttendance = (req, res) => {

    Attendance.update(req.params.id, req.body, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Unable to update attendance.");

        }

        res.redirect("/admin/attendance");

    });

};

// ===============================
// Delete Attendance
// ===============================

exports.deleteAttendance = (req, res) => {

    Attendance.delete(req.params.id, (err) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Unable to delete attendance.");

        }

        res.redirect("/admin/attendance");

    });

};
