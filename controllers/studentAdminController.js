const Student = require("../models/Student");

/**
 * Show all students
 */
exports.showStudents = async (req, res) => {
    try {
        const students = await Student.getAll();

        res.render("admin/students", {
            students
        });
    } catch (err) {
        console.error("Student Error:", err);
        res.status(500).send("Internal Server Error");
    }
};


//Delete Students

exports.deleteStudent = async (req, res) => {
    try {
        await Student.delete(req.params.id);
        res.redirect("/admin/students");
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};
