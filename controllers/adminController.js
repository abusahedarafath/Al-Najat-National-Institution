

const admissionModel = require("../models/admissionModel");

// Dashboard
// Dashboard


exports.dashboard = (req, res) => {

    admissionModel.getDashboardStats((err, statsResult) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        admissionModel.getRecentApplications((err, recentResult) => {

            if (err) {
                console.error(err);
                return res.send("Database Error");
            }

            res.render("admin/dashboard", {
                stats: statsResult[0],
                recentApplications: recentResult
            });

        });

    });

};




// Applications List
exports.showApplications = (req, res) => {
    admissionModel.getAllApplications((err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        res.render("admin/applications", {
            title: "Admission Applications",
            applications: results
        });

    });
};


// =======================================
// Application Details
// =======================================

exports.applicationDetails = (req, res) => {

    const id = req.params.id;

    admissionModel.getApplicationById(id, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Database Error");
        }

        if (!results || results.length === 0) {
            return res.status(404).send("Application Not Found");
        }

        res.render("admin/application-details", {
            application: results[0]
        });

    });

};




// View Single Application
exports.viewApplication = (req, res) => {

    console.log("Route reached");

    const id = req.params.id;
    console.log("ID:", id);

    admissionModel.getApplicationById(id, (err, results) => {

        if (err) {
            console.error("DB Error:", err);
            return res.send("Database Error");
        }

        console.log("Results:", results);

        if (!results || results.length === 0) {
            return res.send("Application not found");
        }

        res.render("admin/application-details", {
            application: results[0]
        });

    });

};







exports.approveApplication = (req, res) => {

    const id = req.params.id;

    admissionModel.getApplicationById(id, (err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        if (!results || results.length === 0) {
            return res.send("Application not found");
        }

        const application = results[0];

        admissionModel.approveApplication(id, (err) => {

            if (err) {
                console.error(err);
                return res.send("Database Error");
            }

admissionModel.createStudentFromApplication(application, (err, result) => {

    if (err) {
        console.error("Student Insert Error:", err);
        return res.send("Error creating student");
    }

    console.log("Student inserted successfully:", result);

    res.redirect("/admin/application/" + id);

});
        });

    });

};







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




