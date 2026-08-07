const ArspDocumentVerification = require("../models/ArspDocumentVerification");
const ArspMember = require("../models/ArspMember");

exports.verify = async (req, res) => {

console.log("Document Number:", req.params.documentNumber);

    try {

      const verification =
    await ArspDocumentVerification.getByDocumentNumber(
        req.params.documentNumber
    );

console.log("Verification:", verification);

if (!verification) {

    return res.render(
        "arsp/verify-document",
        {
            title: "Document Verification",
            valid: false
        }
    );

}

const member =
    await ArspMember.getById(
        verification.member_id
    );

console.log("Member:", member);

        res.render(
            "arsp/verify-document",
            {
                title: "Document Verification",
                valid: true,
                verification,
                member
            }
        );

    } catch (err) {

        console.error(err);

        res.status(500).send("Verification failed.");

    }

};
