const admissionModel = require("../models/admissionModel");

// Admission Page
exports.showAdmissionPage = (req, res) => {
    res.render("admission");
};

// Apply Page
exports.showApplyPage = (req, res) => {
    res.render("apply");
};

// Submit Application
exports.submitApplication = (req, res) => {

    admissionModel.createAdmission(req.body, (err) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        res.send(`
            <h1>Application Submitted Successfully!</h1>
            <a href="/">Back to Home</a>
        `);

    });

};
