const RtseResult =
require("../models/RtseResult");

const RtseSetting =
require("../models/RtseSetting");

const RtseCertificate =
require("../models/RtseCertificate");

const RtseExamSetting =
require("../models/RtseExamSetting");

const RtseApplication =
require("../models/RtseApplication");



// =====================================
// Application Form
// =====================================

exports.applicationPage = async (req, res) => {

    res.render(

        "rtse/application",

        {

            title: "RTSE Online Application"

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

                full_name: req.body.full_name,
                father_name: req.body.father_name,
                mother_name: req.body.mother_name,
                gender: req.body.gender,
                dob: req.body.dob,
                mobile: req.body.mobile,
                email: req.body.email,
                school_name: req.body.school_name,
                district: req.body.district,
                state: req.body.state,
                pincode: req.body.pincode,
                class: req.body.class,
                address: req.body.address,

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

                title: "Application Submitted",

                registrationNo:
                    result.registration_no,

                section:
                    result.section,

                applicationYear:
                    new Date().getFullYear()

            }

        );

    }

    catch (err) {

        console.error(err);

        res.render(

            "rtse/application",

            {

                title: "RTSE Online Application",

                error:

                    "Unable to submit application."

            }

        );

    }

};



// =====================================
// Result Portal
// =====================================

exports.resultPortal = async (req,res)=>{

    const examSetting =
        await RtseExamSetting.get();

    res.render(

        "rtse/result-portal",

        {

            title:"RTSE Result",

            examSetting,

            student:null

        }

    );

};


// =====================================
// Search Result
// =====================================

exports.searchResult = async (req,res)=>{

    try{

        const keyword = req.body.keyword;

        const student =

        await RtseResult.searchResult(

            keyword

        );

        const examSetting =
            await RtseExamSetting.get();

        res.render(

            "rtse/result-portal",

            {

                title:"RTSE Result",

                examSetting,

                student

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Result not found."

        );

        res.redirect(

            "/rtse/result"

        );

    }

};


// =====================================
// View Result
// =====================================

exports.viewResult = async (req,res)=>{

    try{

        const student =

        await RtseResult.getByApplication(

            req.params.id

        );

        const examSetting =
            await RtseExamSetting.get();

        res.render(

            "rtse/result-view",

            {

                title:"RTSE Result",

                examSetting,

                student

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to load result."

        );

        res.redirect(

            "/rtse/result"

        );

    }

};




// =====================================
// Certificate Verification
// =====================================

exports.verifyCertificate = async (req,res)=>{

    try{

        const certificate=

        await RtseCertificate.getByCertificateNumber(

            req.params.number

        );

        const setting=

        await RtseExamSetting.get();

        res.render(

            "rtse/certificate-verification",

            {

                title:"Certificate Verification",

                setting,

                certificate

            }

        );

    }

    catch(err){

        console.error(err);

        res.render(

            "rtse/certificate-verification",

            {

                title:"Certificate Verification",

                setting:null,

                certificate:null

            }

        );

    }

};



// =====================================
// Certificate Portal
// =====================================

exports.certificatePortal = async (req,res)=>{

    res.render(

        "rtse/certificate-portal",

        {

            title:"Certificate Portal",

            certificate:null

        }

    );

};



// =====================================
// Search Certificate
// =====================================

exports.searchCertificate = async (req, res) => {

    try {

        const setting =
            await RtseSetting.get();

        if (!setting.certificate_publish) {

            req.flash(

                "error",

                "Certificates have not been published yet."

            );

            return res.redirect(

                "/rtse/certificate"

            );

        }

        const certificate =
            await RtseCertificate.search(

                req.body.keyword

            );

        if (!certificate) {

            req.flash(

                "error",

                "Certificate not found."

            );

            return res.redirect(

                "/rtse/certificate"

            );

        }

        res.render(

            "rtse/certificate-portal",

            {

                title: "Certificate Portal",

                certificate

            }

        );

    }

    catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to search certificate."

        );

        res.redirect(

            "/rtse/certificate"

        );

    }

};
