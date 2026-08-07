const Teacher = require("../models/Teacher");

// =======================================
// Show All Teachers
// =======================================

exports.showTeachers = async (req, res) => {
    try {

        const teachers = await Teacher.getAll();

        res.render("admin/teachers", {
            title: "Teachers",
            teachers
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// View Teacher Profile
// =======================================

exports.viewTeacher = async (req, res) => {
    try {

        const teacher = await Teacher.getById(req.params.id);

        if (!teacher) {
            return res.status(404).send("Teacher not found");
        }

        res.render("admin/teacher-profile", {
            teacher
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Add Teacher Page
// =======================================

exports.addTeacherPage = (req, res) => {

    res.render("admin/add-teacher");

};

// =======================================
// Save Teacher
// =======================================

exports.createTeacher = async (req, res) => {
    try {

        const teacherData = {

            teacher_id: req.body.teacher_id,
            full_name: req.body.full_name,
            father_name: req.body.father_name,
            mother_name: req.body.mother_name,
            gender: req.body.gender,
            dob: req.body.dob,
            mobile: req.body.mobile,
            email: req.body.email,
            address: req.body.address,
            qualification: req.body.qualification,
            subject: req.body.subject,
            designation: req.body.designation,
            joining_date: req.body.joining_date,
            salary: req.body.salary,
            photo: req.file ? req.file.filename : null,
            status: req.body.status || "Active"

        };

        await Teacher.create(teacherData);

        res.redirect("/admin/teachers");

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Edit Teacher Page
// =======================================

exports.editTeacherPage = async (req, res) => {
    try {

        const teacher = await Teacher.getById(req.params.id);

        if (!teacher) {
            return res.status(404).send("Teacher not found");
        }

        res.render("admin/edit-teacher", {
            teacher
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Update Teacher
// =======================================

exports.updateTeacher = async (req, res) => {
    try {

        const id = req.params.id;

        const teacherData = {

            full_name: req.body.full_name,
            father_name: req.body.father_name,
            mother_name: req.body.mother_name,
            gender: req.body.gender,
            dob: req.body.dob,
            mobile: req.body.mobile,
            email: req.body.email,
            address: req.body.address,
            qualification: req.body.qualification,
            subject: req.body.subject,
            designation: req.body.designation,
            joining_date: req.body.joining_date,
            salary: req.body.salary,
            status: req.body.status,
            photo: req.file ? req.file.filename : req.body.old_photo

        };

        await Teacher.update(id, teacherData);

        res.redirect("/admin/teacher/" + id);

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Delete Teacher
// =======================================

exports.deleteTeacher = async (req, res) => {
    try {

        await Teacher.delete(req.params.id);

        res.redirect("/admin/teachers");

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};
