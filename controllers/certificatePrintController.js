const Certificate = require("../models/Certificate");

// ======================================
// Print Certificate
// ======================================

exports.printCertificate = async (req, res) => {

    try {

        const certificate = await Certificate.getById(req.params.id);

        if (!certificate) {
            return res.redirect("/admin/certificates");
        }

        let template = "admin/certificates/transfer-certificate";

        switch (certificate.certificate_type) {

            case "Transfer Certificate":
                template = "admin/certificates/transfer-certificate";
                break;

            case "Character Certificate":
                template = "admin/certificates/character-certificate";
                break;

            case "Bonafide Certificate":
                template = "admin/certificates/bonafide-certificate";
                break;

            case "Study Certificate":
                template = "admin/certificates/study-certificate";
                break;

            case "Fee Clearance Certificate":
                template = "admin/certificates/fee-clearance-certificate";
                break;

            case "Migration Certificate":
                template = "admin/certificates/migration-certificate";
                break;

            case "Experience Certificate":
                template = "admin/certificates/experience-certificate";
                break;

            default:
                template = "admin/certificates/transfer-certificate";

        }

        res.render(template, {
            title: certificate.certificate_type,
            certificate
        });

    } catch (err) {

        console.error(err);
        res.status(500).send(err.stack);

    }

};
