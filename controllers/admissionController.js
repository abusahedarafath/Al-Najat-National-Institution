const admissionModel = require("../models/admissionModel");

// Admission Page
exports.showAdmissionPage = (req, res) => {
    res.render("admission");
};

// Apply Page
exports.showApplyPage = (req, res) => {
    res.render("apply");
};

exports.submitApplication = async (req, res) => {
    try {

        console.log("=== SUBMIT START ===");
        console.log(req.body);

        const result = await admissionModel.createAdmission(req.body);

        console.log("INSERT RESULT:", result);

        res.send("Application Submitted Successfully!");

    } catch (err) {

        console.error("SUBMIT ERROR:");
        console.error(err);

        res.status(500).send(err.message);

    }
};
