const ArspDocumentVerification = require("../models/ArspDocumentVerification");
const ArspMember = require("../models/ArspMember");

exports.verify = async (req, res) => {

    return res.render(
        "arsp/verify-document",
        {
            title: "ARSP QR Verification",
            valid: false,
            scannerOnly: true,
            message: "Please Verify the QR using the official ARSP QR Scanner."
        }
    );

};
