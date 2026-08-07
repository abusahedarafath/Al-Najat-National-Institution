const Student = require("../models/Student");

// ===============================
// Show All Students
// ===============================
exports.showStudents = async (req, res) => {
    try {
        const students = await Student.getAll();

        res.render("admin/students", {
            title: "Students",
            students
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};

// ===============================
// View Student
// ===============================
exports.viewStudent = async (req, res) => {
    try {
        const student = await Student.getById(req.params.id);

        if (!student) {
            return res.status(404).send("Student not found");
        }

        res.render("admin/student-profile", {
            student
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};

// ===============================
// Edit Student
// ===============================
exports.editStudentPage = async (req, res) => {
    try {
        const student = await Student.getById(req.params.id);

        if (!student) {
            return res.status(404).send("Student not found");
        }

        res.render("admin/edit-student", {
            student
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};

// ===============================
// Update Student
// ===============================
exports.updateStudent = async (req, res) => {
    try {
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

        console.log("req.file =", req.file);
        console.log("studentData =", studentData);

        await Student.update(id, studentData);

        res.redirect("/admin/student/" + id);

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};
// ===============================
// Deactivate Student
// ===============================
exports.deactivateStudent = async (req, res) => {
    try {
        await Student.deactivate(req.params.id);

        res.redirect("/admin/student/" + req.params.id);

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};
