const Application = require("../models/Application");
const ApplicationDocument = require("../models/ApplicationDocument");

// ===============================
// SHOW ALL APPLICATIONS
// ===============================
exports.showApplications = async (req, res) => {
    try {
        const applications = await Application.getAll();

        res.render("admin/applications", {
            title: "Admission Applications",
            applications
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// ===============================
// VIEW APPLICATION
// ===============================
exports.viewApplication = async (req, res) => {
    try {
        const rows = await Application.getById(req.params.id);

        if (!rows || rows.length === 0) {
            return res.status(404).send("Application not found");
        }

        const application = rows[0];
        const documents = await ApplicationDocument.getByApplicationId(req.params.id);

        res.render("admin/application-details", {
            title: "Application Details",
            application,
            documents
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// ===============================
// EDIT APPLICATION
// ===============================
exports.editApplication = async (req, res) => {
    try {
        const rows = await Application.getById(req.params.id);

        if (!rows || rows.length === 0) {
            return res.status(404).send("Application not found");
        }

        res.render("admin/edit-application", {
            title: "Edit Application",
            application: rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};






exports.deleteApplication = async (req, res) => {
    try {
        const rows = await Application.getById(req.params.id);

        if (!rows || rows.length === 0) {
            return res.status(404).send("Application not found");
        }

        await ApplicationDocument.deleteByApplicationId(req.params.id);
        await Application.delete(req.params.id);

        res.redirect("/admin/applications");

    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};
