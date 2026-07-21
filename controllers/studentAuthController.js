const bcrypt = require("bcryptjs");
const StudentUser = require("../models/StudentUser");
const Student = require("../models/Student");


// ===============================
// Student Login Page
// ===============================
exports.showLogin = (req, res) => {

    res.render("student/login", {
        title: "Student Login"
    });

};


// ===============================
// Student Login
// ===============================
exports.login = (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {

        return res.render("student/login", {
            title: "Student Login",
            error: "Username and Password are required."
        });

    }

    StudentUser.findByUsername(username, async (err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        if (!results || results.length === 0) {

            return res.render("student/login", {
                title: "Student Login",
                error: "Invalid Username or Password."
            });

        }

        const user = results[0];

        const passwordMatched = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatched) {

            return res.render("student/login", {
                title: "Student Login",
                error: "Invalid Username or Password."
            });

        }

Student.getById(user.student_id, (studentErr, studentRows) => {

    if (studentErr || studentRows.length === 0) {

        return res.render("student/login", {
            title: "Student Login",
            error: "Student record not found."
        });

    }

    const student = studentRows[0];

    req.session.student = {
        id: student.id,
        student_id: student.student_id,
        username: user.username,
        full_name: student.full_name,
        course: student.course
    };

    StudentUser.updateLastLogin(user.student_id, () => {});

    res.redirect("/student/dashboard");

});
    });

};


// ===============================
// Student Logout
// ===============================
exports.logout = (req, res) => {

    req.session.destroy(() => {

        res.redirect("/student/login");

    });

};
