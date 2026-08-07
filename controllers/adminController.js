const Application = require("../models/Application");
const Student = require("../models/Student");
const galleryModel = require("../models/galleryModel");
const ApplicationDocument = require("../models/ApplicationDocument");
const fs = require("fs");
const path = require("path");


// =======================================
// Dashboard
// =======================================

exports.dashboard = async (req, res) => {

    try {

        const stats = await Application.getDashboardStats();
        const recentApplications = await Application.getRecentApplications();

        res.render("admin/dashboard", {

            stats,
            recentApplications,

            totalApplications: stats.total || 0,
            pendingApplications: stats.pending || 0,
            approvedApplications: stats.approved || 0,
            rejectedApplications: stats.rejected || 0

        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }

};
// =======================================
// Applications List
// =======================================

exports.showApplications = async (req, res) => {
    try {
    const applications = await Application.getAll();
        res.render("admin/applications", {
            title: "Admission Applications",
            applications
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};

// =======================================
// Application Details
// =======================================

exports.applicationDetails = async (req, res) => {

    try {

        const id = req.params.id;

        const rows = await Application.getById(id);

        if (!rows || rows.length === 0) {
            return res.status(404).send("Application Not Found");
        }

        const application = rows[0];

        const documents =
            await ApplicationDocument.getByApplicationId(id);

        res.render("admin/application-details", {

            application,
            documents

        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }

};

// =======================================
// View Single Application
// =======================================

exports.viewApplication = async (req, res) => {

    try {

        const id = req.params.id;

        const rows = await Application.getById(id);

        if (!rows || rows.length === 0) {
            return res.status(404).send("Application not found");
        }

        const application = rows[0];

        const documents =
            await ApplicationDocument.getByApplicationId(id);

        res.render("admin/application-details", {

            application,
            documents

        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }

};

// =======================================
// Approve Application
// =======================================


exports.approveApplication = async (req, res) => {
    try {

        const id = req.params.id;

        const rows = await Application.getById(id);

        if (!rows || rows.length === 0) {
            return res.status(404).send("Application not found");
        }

        const application = rows[0];

        await Application.updateStatus(id, "Approved");


const existingStudent = await Student.findByApplicationId(id);

if (!existingStudent) {

    const documents = await ApplicationDocument.getByApplicationId(id);
    const photo = documents.find(doc => doc.document_type === "photo");

    if (photo) {
        const source = path.join(
            __dirname,
            "../public/uploads/applications",
            photo.file_name
        );

        const destination = path.join(
            __dirname,
            "../public/uploads/students",
            photo.file_name
        );

        if (fs.existsSync(source)) {
            fs.copyFileSync(source, destination);
        }
    }

    await Student.createFromApplication(
        application,
        photo ? photo.file_name : null
    );
}

res.redirect("/admin/application/" + id);

} catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
}
};


// =======================================
// Show Students
// =======================================

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

// =======================================
// View Student
// =======================================

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

// =======================================
// Edit Student
// =======================================

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

// =======================================
// Update Student
// =======================================

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

await Student.update(id, studentData);
        res.redirect("/admin/student/" + id);

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};

// =======================================
// Deactivate Student
// =======================================

exports.deactivateStudent = async (req, res) => {
    try {
        const id = req.params.id;

await Student.deactivate(id);
        res.redirect("/admin/student/" + id);

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};








exports.updateImageCaption = async (req, res) => {
    try {
        const { imageId, albumId } = req.params;
        const { caption } = req.body;

        await galleryModel.updateImageCaption(imageId, caption);

        req.flash("success", "Caption updated successfully.");
        res.redirect(`/admin/gallery/${albumId}/images`);

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to update caption.");
        res.redirect("back");
    }
};
