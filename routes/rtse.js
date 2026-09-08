const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const rtseController =
    require("../controllers/rtseController");

const rtsePublicController =
    require("../controllers/rtsePublicController");

const rtseStudentController = require("../controllers/rtseStudentController");
const rtseStudentAuth = require("../middleware/rtseStudentAuth");
const rtseAdmitDownloadController = require("../controllers/rtseAdmitDownloadController");

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
// RTSE STUDENT PORTAL
// =====================================

router.get(
    "/student/login",
    rtseStudentController.loginPage
);

router.post(
    "/student/login",
    multer().none(),
    rtseStudentController.login
);

router.get(
    "/student/dashboard",
    rtseStudentAuth.isLoggedIn,
    rtseStudentController.dashboard
);

router.get(
    "/student/logout",
    rtseStudentAuth.isLoggedIn,
    rtseStudentController.logout
);


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
    rtsePublicController.requireApplicationOpen,
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
// AUTHENTICATED RTSE STUDENT APPROVED SLIP
// =====================================

router.get(
    "/student/approved-slip",
    rtseStudentAuth.isLoggedIn,
    rtseStudentController.approvedSlip
);


// =====================================
// PRIVATE RTSE STUDENT SERVICES
// =====================================

router.get(
    "/student/registration-slip",
    rtseStudentAuth.isLoggedIn,
    rtseStudentController.registrationSlip
);

router.get(
    "/student/result",
    rtseStudentAuth.isLoggedIn,
    rtseStudentController.result
);

router.get(
    "/student/certificate",
    rtseStudentAuth.isLoggedIn,
    rtseStudentController.certificate
);


// =====================================
// RTSE Student Admit Card Verification
// =====================================

router.get(
    "/student/admit-download/status",
    rtseStudentAuth.isLoggedIn,
    rtseAdmitDownloadController.getVerificationStatus
);

router.get(
    "/student/admit-download/google-status",
    rtseStudentAuth.isLoggedIn,
    rtseAdmitDownloadController.googleStatus
);

router.post(
    "/student/admit-download/google",
    rtseStudentAuth.isLoggedIn,
    rtseAdmitDownloadController.verifyGoogle
);

router.post(
    "/student/admit-download/details",
    rtseStudentAuth.isLoggedIn,
    rtseAdmitDownloadController.submitDetails
);

router.get(
    "/student/admit-card",
    rtseStudentAuth.isLoggedIn,
    rtseStudentController.admitCard
);


// =====================================
// PUBLIC RTSE REGISTRATION VERIFICATION
// =====================================

router.get(
    "/verify/:registrationNo",
    rtseController.verifyRegistration
);


module.exports = router;
