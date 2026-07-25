const Student = require("../models/Student");

exports.dashboard = (req, res) => {

    Student.getById(req.session.student.id, (err, rows) => {

        if (err || rows.length === 0) {
            return res.redirect("/student/logout");
        }

        res.render("student/dashboard", {
            title: "Student Dashboard",
            student: rows[0]
        });

    });

};
