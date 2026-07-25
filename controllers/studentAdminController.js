const Student = require("../models/Student");

/**
 * Show all students
 */
exports.showStudents = (req, res) => {

    Student.getAll((err, students) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Internal Server Error");
        }

        res.render("admin/students", {
            students
        });

    });

};

