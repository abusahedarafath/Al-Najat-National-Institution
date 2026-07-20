const admissionModel = require("../models/admissionModel");

// ===============================
// Show All Applications
// ===============================
exports.showApplications = (req, res) => {

    admissionModel.getAllApplications((err, applications) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        res.render("admin/applications", {
            applications
        });

    });

};

// ===============================
// View Single Application
// ===============================
exports.viewApplication = (req, res) => {

    const id = req.params.id;

    admissionModel.getApplicationById(id, (err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        if (!results || results.length === 0) {
            return res.status(404).send("Application not found");
        }

        res.render("admin/application-details", {
            application: results[0]
        });

    });

};

// ===============================
// Approve Application
// (Temporary: forwards to existing logic)
// ===============================
exports.approveApplication = (req, res, next) => {

    return next();

};
