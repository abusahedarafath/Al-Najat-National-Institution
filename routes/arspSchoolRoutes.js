const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const authController =
    require("../controllers/arspSchoolAuthController");

const schoolAuth =
    require("../middleware/arspSchoolAuth");

const schoolRtseStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "public/uploads/rtse");
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

const schoolRtseUpload = multer({
    storage: schoolRtseStorage
});



// =====================================
// Public School Login
// =====================================

router.get(
    "/arsp/school/login",
    authController.loginPage
);

router.post(
    "/arsp/school/login",
    authController.login
);


// =====================================
// School Password Change
// =====================================

router.get(
    "/arsp/school/change-password",
    schoolAuth.isSchoolLoggedIn,
    authController.changePasswordPage
);

router.post(
    "/arsp/school/change-password",
    schoolAuth.isSchoolLoggedIn,
    authController.changePassword
);




// =====================================
// School RTSE Student Registration
// =====================================

router.get(
    "/arsp/school/rtse-register",
    schoolAuth.isSchoolLoggedIn,
    schoolAuth.requirePasswordChanged,
    authController.rtseRegisterPage
);

router.post(
    "/arsp/school/rtse-register",
    schoolAuth.isSchoolLoggedIn,
    schoolAuth.requirePasswordChanged,
    schoolRtseUpload.fields([
        {
            name: "photo",
            maxCount: 1
        },
        {
            name: "identity_document",
            maxCount: 1
        }
    ]),
    authController.rtseRegister
);

// =====================================
// School RTSE Student View
// =====================================

router.get(
    "/arsp/school/rtse-students/:id",
    schoolAuth.isSchoolLoggedIn,
    schoolAuth.requirePasswordChanged,
    authController.rtseStudentView
);


// =====================================
// School RTSE Student Edit
// =====================================

router.get(
    "/arsp/school/rtse-students/:id/edit",
    schoolAuth.isSchoolLoggedIn,
    schoolAuth.requirePasswordChanged,
    authController.rtseStudentEdit
);


router.post(
    "/arsp/school/rtse-students/:id/edit",
    schoolAuth.isSchoolLoggedIn,
    schoolAuth.requirePasswordChanged,
    authController.rtseStudentUpdate
);


// =====================================
// School RTSE Student Registry
// =====================================
router.get(
    "/arsp/school/rtse-students",
    schoolAuth.isSchoolLoggedIn,
    schoolAuth.requirePasswordChanged,
    authController.rtseStudents
);

// =====================================
// School Dashboard
// =====================================

router.get(
    "/arsp/school/dashboard",
    schoolAuth.isSchoolLoggedIn,
    schoolAuth.requirePasswordChanged,
    authController.dashboard
);


// =====================================
// Logout
// =====================================

router.get(
    "/arsp/school/logout",
    schoolAuth.isSchoolLoggedIn,
    authController.logout
);

router.post(
    "/arsp/school/logout",
    schoolAuth.isSchoolLoggedIn,
    authController.logout
);


// =====================================
// Admin Credential Slip
// =====================================

router.get(
    "/admin/arsp/school/:id/credential-slip",
    authController.credentialSlip
);

router.post(
    "/admin/arsp/school/:id/credential-slip/close",
    authController.closeCredentialSlip
);


module.exports = router;
