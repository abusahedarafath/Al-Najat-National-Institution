const express = require("express");
const router = express.Router();

const arspTeamController = require("../controllers/arspTeamController");
const arspProfileController = require("../controllers/arspProfileController");
const arspAuthController = require("../controllers/arspAuthController");

const arspMemberAuth = require("../middleware/arspMemberAuth");

// ======================================
// Public ARSP Pages
// ======================================

router.get(
    "/arsp/team",
    arspTeamController.team
);

router.get(
    "/arsp/founder",
    arspTeamController.founder
);

router.get(
    "/arsp/organizing-body",
    arspTeamController.organizingBody
);

router.get(
    "/arsp/chief-adviser",
    arspTeamController.chiefAdviser
);

router.get(
    "/arsp/advisory-body",
    arspTeamController.advisoryBody
);

router.get(
    "/arsp/member/:memberId",
    arspProfileController.profile
);

router.get(
    "/arsp/verify/:memberId",
    arspProfileController.verify
);

// ======================================
// Member Authentication
// ======================================

router.get(
    "/arsp/login",
    arspAuthController.loginPage
);

router.post(
    "/arsp/login",
    arspAuthController.login
);

router.get(
    "/arsp/dashboard",
    arspMemberAuth,
    arspAuthController.dashboard
);

router.get(
    "/arsp/logout",
    arspMemberAuth,
    arspAuthController.logout
);

// ======================================
// Password Management
// ======================================

router.get(
    "/arsp/change-password",
    arspMemberAuth,
    arspAuthController.changePasswordPage
);

router.post(
    "/arsp/change-password",
    arspMemberAuth,
    arspAuthController.changePassword
);

router.get(
    "/arsp/forgot-password",
    arspAuthController.forgotPasswordPage
);

router.post(
    "/arsp/forgot-password",
    arspAuthController.sendOTP
);

router.get(
    "/arsp/verify-otp",
    arspAuthController.verifyOtpPage
);

router.post(
    "/arsp/verify-otp",
    arspAuthController.verifyOTP
);

router.get(
    "/arsp/reset-password",
    arspAuthController.resetPasswordPage
);

router.post(
    "/arsp/reset-password",
    arspAuthController.resetPassword
);

// ======================================
// Activity
// ======================================

router.get(
    "/arsp/activity",
    arspMemberAuth,
    arspAuthController.activity
);

// ======================================
// Digital ID Card
// ======================================

router.get(
    "/arsp/id-card/pdf",
    arspMemberAuth,
    arspAuthController.downloadIdCard
);



router.get(
    "/arsp/registration-slip",
    arspMemberAuth,
    arspAuthController.registrationSlip
);




// =====================================
// MEMBER DOCUMENTS
// =====================================

router.get(
    "/arsp/registration-slip",
    arspMemberAuth,
    arspAuthController.registrationSlip
);






// =====================================
// APPOINTMENT LETTER
// =====================================

router.get(
    "/arsp/appointment-letter",
    arspMemberAuth,
    arspAuthController.appointmentLetter
);





module.exports = router;
