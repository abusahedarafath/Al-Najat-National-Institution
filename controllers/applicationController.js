const Application = require("../models/Application");

function generateApplicationNumber() {
    const year = "2027";
    const random = Date.now().toString().slice(-6);
    return `ANI-${year}-${random}`;
}

exports.submitApplication = (req, res) => {

    console.log("========== APPLICATION ==========");
    console.log("BODY:");
    console.log(req.body);

    console.log("FILES:");
    console.log(req.files);

    const data = {

        application_no: generateApplicationNumber(),
        session: "2027",

        full_name: req.body.full_name,
        father_name: req.body.father_name,
        mother_name: req.body.mother_name,

        dob: req.body.dob,
        gender: req.body.gender,

        mobile: req.body.mobile,
        email: req.body.email,

        address: req.body.address,

        // Updated to match the wizard form
        course: req.body.admission_category,

        previous_school: req.body.previous_school,

        pen_no: req.body.pen_no,
        apaar_id: req.body.apaar_id,
        siksha_setu_id: req.body.siksha_setu_id
    };

    if (!data.full_name || !data.mobile || !data.course) {
        return res.status(400).send("Required fields are missing.");
    }

    Application.create(data, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Database Error");
        }

res.render("admission2027/success", {
    application_no: data.application_no
});
    });

};
