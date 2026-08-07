const Certificate = require("../models/Certificate");
const Student = require("../models/Student");

// ======================================
// Display All Certificates
// ======================================

exports.showCertificates = async (req, res) => {

    try {

        const certificates = await Certificate.getAll();

        res.render("admin/certificates", {

            title: "Certificates",

            certificates

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Add Certificate Page
// ======================================

exports.addCertificatePage = async (req, res) => {
    try {

        const certificateNo =
            await Certificate.generateCertificateNo();

        const students = await Student.getAll();

        res.render("admin/add-certificate", {
            title: "Generate Certificate",
            students,
            certificateNo
        });

    } catch (err) {

        console.error(err);
        res.status(500).send(err.stack);

    }
};

// ======================================
// Create Certificate
// ======================================

exports.createCertificate = async (req, res) => {

    try {

        await Certificate.create(req.body);

        res.redirect("/admin/certificates");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// View Certificate
// ======================================

exports.viewCertificate = async (req, res) => {

    try {

        const certificate =
            await Certificate.getById(req.params.id);

        if (!certificate) {

            return res.redirect("/admin/certificates");

        }

        res.render("admin/certificate-details", {

            title: "Certificate Details",

            certificate

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Edit Certificate Page
// ======================================

exports.editCertificatePage = async (req, res) => {

    try {

        const certificate =
            await Certificate.getById(req.params.id);

        if (!certificate) {
            return res.redirect("/admin/certificates");
        }

        const students = await Student.getAll();

        res.render("admin/edit-certificate", {

            title: "Edit Certificate",

            certificate,

            students

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};
// ======================================
// Update Certificate
// ======================================

exports.updateCertificate = async (req, res) => {

    try {

        await Certificate.update(req.params.id, req.body);

        res.redirect("/admin/certificates");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};

// ======================================
// Delete Certificate
// ======================================

exports.deleteCertificate = async (req, res) => {

    try {

        await Certificate.delete(req.params.id);

        res.redirect("/admin/certificates");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};
