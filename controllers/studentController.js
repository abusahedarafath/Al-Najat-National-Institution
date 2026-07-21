const admissionModel = require("../models/admissionModel");

// ===============================
// Show All Students
// ===============================
exports.showStudents = (req, res) => {

    admissionModel.getAllStudents((err, students) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        res.render("admin/students", {
            title: "Students",
            students: students
        });

    });

};

// ===============================
// View Student
// ===============================
exports.viewStudent = (req, res) => {

    const id = req.params.id;

    admissionModel.getStudentById(id, (err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        if (!results || results.length === 0) {
            return res.send("Student not found");
        }

        res.render("admin/student-profile", {
            student: results[0]
        });

    });

};

// ===============================
// Edit Student Page
// ===============================
exports.editStudentPage = (req, res) => {

    const id = req.params.id;

    admissionModel.getStudentForEdit(id, (err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        if (!results || results.length === 0) {
            return res.send("Student not found");
        }

        res.render("admin/edit-student", {
            student: results[0]
        });

    });

};

// ===============================
// Update Student
// ===============================
exports.updateStudent = (req, res) => {

    const id = req.params.id;

    const studentData = {
        full_name: req.body.full_name,
        father_name: req.body.father_name,
        mother_name: req.body.mother_name,
        dob: req.body.dob,
        gender: req.body.gender,
        mobile: req.body.mobile,
        email: req.body.email,
        address: req.body.address,
        course: req.body.course,
        previous_school: req.body.previous_school,
        status: req.body.status
    };

    if (req.file) {
        studentData.photo = req.file.filename;
    }

    admissionModel.updateStudent(id, studentData, (err) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        res.redirect("/admin/student/" + id);

    });

};

// ===============================
// Deactivate Student
// ===============================
exports.deactivateStudent = (req, res) => {

    const id = req.params.id;

    admissionModel.deactivateStudent(id, (err) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        res.redirect("/admin/student/" + id);

    });

};
