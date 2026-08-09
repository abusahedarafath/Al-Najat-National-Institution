const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const rtseController =
    require("../controllers/rtseController");

// =====================================
// Upload Configuration
// =====================================

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(
            null,
            "public/uploads/rtse"
        );

    },

    filename(req, file, cb) {

        cb(
            null,
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname)
        );

    }

});

const upload = multer({
    storage
});


// =====================================
// PUBLIC RTSE HOME
// =====================================

router.get("/", (req, res) => {

    res.redirect("/rtse/apply");

});


// =====================================
// PUBLIC APPLICATION FORM
// =====================================

router.get(
    "/apply",
    rtseController.applicationPage
);


// =====================================
// PUBLIC APPLICATION SUBMISSION
// =====================================

router.post(
    "/apply",

    upload.fields([
        {
            name: "photo",
            maxCount: 1
        },
        {
            name: "identity_document",
            maxCount: 1
        }
    ]),

    rtseController.submitApplication
);


// =====================================
// REVIEW APPLICATION
// =====================================

router.get(
    "/review",
    rtseController.reviewApplication
);

// =====================================
// EDIT APPLICATION
// =====================================

router.get(
    "/edit",
    rtseController.editApplication
);

// =====================================
// CONFIRM & SUBMIT APPLICATION
// =====================================

router.post(
    "/confirm",
    rtseController.confirmApplication
);

// =====================================
// PERMANENT REGISTRATION SLIP
// =====================================

router.get(
    "/registration-slip",
    rtseController.registrationSlipPage
);

router.post(
    "/registration-slip",
    rtseController.registrationSlipSearch
);


// =====================================
// PUBLIC RTSE REGISTRATION VERIFICATION
// =====================================

router.get(
    "/verify/:registrationNo",
    rtseController.verifyRegistration
);


// =====================================
// PUBLIC RESULT PORTAL
// =====================================

router.get(
    "/result",
    rtseController.resultPortal
);

router.post(
    "/result",
    rtseController.searchResult
);

router.get(
    "/result/:id",
    rtseController.viewResult
);


// =====================================
// PUBLIC CERTIFICATE PORTAL
// =====================================

router.get(
    "/certificate",
    rtseController.certificatePortal
);

router.post(
    "/certificate",
    rtseController.searchCertificate
);


// =====================================
// PUBLIC CERTIFICATE VERIFICATION
// =====================================

router.get(
    "/verify/certificate/:number",
    rtseController.verifyCertificate
);


module.exports = router;
