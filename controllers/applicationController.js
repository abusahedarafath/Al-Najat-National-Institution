const Application = require("../models/Application");

function generateApplicationNumber(callback) {

    Application.getLastApplication((err, results) => {

        if (err) return callback(err);

        let nextNumber = 1;

        if (results.length > 0 && results[0].application_no) {

            const lastNumber = parseInt(
                results[0].application_no.replace("ANI2027", ""),
                10
            );

            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        const applicationNo =
            "ANI2027" + String(nextNumber).padStart(5, "0");

        callback(null, applicationNo);

    });

}

exports.submitApplication = (req, res) => {

    console.log("========== APPLICATION ==========");
    console.log("BODY:");
    console.log(req.body);

    console.log("FILES:");
    console.log(req.files);

    generateApplicationNumber((err, applicationNo) => {

        if (err) {
            console.error(err);
            return res.status(500).send("Application number generation failed.");
        }

        const data = {

            application_no: applicationNo,
            session: "2027",

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

Application.create(data, (err, result) => {

    if (err) {
        console.error(err);
        return res.status(500).send("Database Error");
    }

    console.log(result);

    res.render("admission2027/success", {
        application_no: data.application_no
    });

});
    });

};
