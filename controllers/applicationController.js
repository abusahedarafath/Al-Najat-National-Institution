const Application = require("../models/Application");
const ApplicationDocument = require("../models/ApplicationDocument");

async function generateApplicationNumber() {
    const results = await Application.getLastApplication();

    const year = new Date().getFullYear();
    let nextNumber = 1;

    if (results.length > 0 && results[0].application_no) {
        const lastNumber = parseInt(
            results[0].application_no.replace(`ANI${year}`, ""),
            10
        );

        if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
        }
    }

    return `ANI${year}${String(nextNumber).padStart(5, "0")}`;
}

exports.submitApplication = async (req, res) => {
    try {
        console.log("========== APPLICATION ==========");
        console.log(req.body);
        console.log(req.files);

        const applicationNo = await generateApplicationNumber();

        const data = {
            application_no: applicationNo,
            session: String(new Date().getFullYear()),

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

            pen_no: req.body.pen_no,
            apaar_id: req.body.apaar_id,
            siksha_setu_id: req.body.siksha_setu_id
        };

        if (!data.full_name || !data.mobile || !data.course) {
            return res.status(400).send("Required fields are missing.");
        }

        const result = await Application.create(data);
        const applicationId = result.insertId;

        const fileFields = [
            "photo",
            "signature",
            "birth_certificate",
            "tc",
            "marksheet",
            "aadhaar"
        ];

        for (const field of fileFields) {
            if (req.files && req.files[field] && req.files[field][0]) {
                await ApplicationDocument.create(
                    applicationId,
                    field,
                    req.files[field][0].filename
                );
            }
        }

        res.render("admission2027/success", {
            application_no: applicationNo
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};
