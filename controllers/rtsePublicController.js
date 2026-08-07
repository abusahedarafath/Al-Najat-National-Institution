const RtseApplication = require("../models/RtseApplication");


// =====================================
// Application Form
// =====================================

exports.applicationPage = async (req, res) => {

    res.render(

        "rtse/application",

        {

            title:
                "RTSE Online Application"

        }

    );

};


// =====================================
// Submit Application
// =====================================

exports.submitApplication = async (req, res) => {

    try {

        const result =
            await RtseApplication.create({

                full_name:
                    req.body.full_name,

                father_name:
                    req.body.father_name,

                mother_name:
                    req.body.mother_name,

                gender:
                    req.body.gender,

                dob:
                    req.body.dob,

                mobile:
                    req.body.mobile,

                email:
                    req.body.email,

                school_name:
                    req.body.school_name,

                district:
                    req.body.district,

                state:
                    req.body.state,

                pincode:
                    req.body.pincode,

                class:
                    req.body.class,

                address:
                    req.body.address,

                photo:
                    req.files.photo[0].filename,

                identity_document:
                    req.files.identity_document
                        ? req.files.identity_document[0].filename
                        : null

            });

        res.render(

            "rtse/acknowledgement",

            {

                title:
                    "Application Submitted",

                registrationNo:
                    result.registration_no,

                section:
                    result.section,

                applicationYear:
                    new Date().getFullYear()

            }

        );

    } catch (err) {

        console.error(err);

        res.render(

            "rtse/application",

            {

                title:
                    "RTSE Online Application",

                error:
                    "Unable to submit application."

            }

        );

    }

};
