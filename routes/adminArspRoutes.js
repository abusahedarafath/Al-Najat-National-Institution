const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);


const createUploader = require("../middleware/uploadFactory");

const upload = createUploader("arsp-members");

const processArspMemberPhoto = require("../middleware/processArspMemberPhoto");
const adminArspController = require("../controllers/adminArspController");
const arspIdCardController = require("../controllers/arspIdCardController");





// ======================================
// ARSP Dashboard
// ======================================

router.get(
    "/admin/arsp",
    authMiddleware.isLoggedIn,
    adminArspController.dashboard
);

// ======================================
// Register Member
// ======================================

router.get(
    "/admin/arsp/register",
    authMiddleware.isLoggedIn,
    adminArspController.registerPage
);

router.post(
    "/admin/arsp/register",
    authMiddleware.isLoggedIn,
    upload.fields([

    {

        name: "photo",

        maxCount: 1

    },

    {

        name: "identity_front",

        maxCount: 1

    },

    {

        name: "identity_back",

        maxCount: 1

    }

]),
    processArspMemberPhoto,
    adminArspController.registerMember
);

// ======================================
// Member Registry
// ======================================

router.get(
    "/admin/arsp/members",
    authMiddleware.isLoggedIn,
    adminArspController.members
);


router.post(
    "/admin/arsp/member/:id/remove-position",
    adminArspController.removePosition
);





// ======================================
// Founder
// ======================================

router.get(
    "/admin/arsp/founder",
    authMiddleware.isLoggedIn,
    adminArspController.founder
);

// ======================================
// Organizing Body
// ======================================

router.get(
    "/admin/arsp/organizing-body",
    authMiddleware.isLoggedIn,
    adminArspController.organizingBody
);

// ======================================
// Chief Adviser
// ======================================

router.get(
    "/admin/arsp/chief-adviser",
    authMiddleware.isLoggedIn,
    adminArspController.chiefAdviser
);

// ======================================
// Advisory Body
// ======================================

router.get(
    "/admin/arsp/advisory-body",
    authMiddleware.isLoggedIn,
    adminArspController.advisoryBody
);

// ======================================
// Assign Position
// ======================================

router.get(
    "/admin/arsp/member/:id/assign",
    authMiddleware.isLoggedIn,
    adminArspController.assignPositionPage
);

router.post(
    "/admin/arsp/member/:id/assign",
    authMiddleware.isLoggedIn,
    adminArspController.assignPosition
);

// ======================================
// Member Profile
// ======================================

router.get(
    "/admin/arsp/member/:id",
    authMiddleware.isLoggedIn,
    adminArspController.memberProfile
);


router.get(
    "/admin/arsp/member/:id/appointment-letter",
    adminArspController.appointmentLetter
);


// ======================================
// Edit Member
// ======================================

router.get(
    "/admin/arsp/member/:id/edit",
    authMiddleware.isLoggedIn,
    adminArspController.editMemberPage
);

router.post(
    "/admin/arsp/member/:id/edit",
    authMiddleware.isLoggedIn,
    upload.fields([
        {
            name: "photo",
            maxCount: 1
        },
        {
            name: "identity_front",
            maxCount: 1
        },
        {
            name: "identity_back",
            maxCount: 1
        }
    ]),
    processArspMemberPhoto,
    adminArspController.updateMember
);

// ======================================
// Digital ID Card
// ======================================

router.get(
    "/admin/arsp/member/:id/id-card",
    authMiddleware.isLoggedIn,
    arspIdCardController.view
);


// ======================================
// Account Slip
// ======================================

router.get(

    "/admin/arsp/member/:id/account-slip",

    authMiddleware.isLoggedIn,

    adminArspController.accountSlip

);

// ======================================
// Toggle Member Status
// ======================================

router.get(

    "/admin/arsp/member/:id/toggle-status",

    authMiddleware.isLoggedIn,

    adminArspController.toggleStatus

);

// ======================================
// Delete Member
// ======================================

router.post(

    "/admin/arsp/member/:id/delete",

    authMiddleware.isLoggedIn,

    adminArspController.deleteMember

);


// ======================================
// Reset Password
// ======================================

router.get(

    "/admin/arsp/member/:id/reset-password",

    authMiddleware.isLoggedIn,

    adminArspController.resetPasswordPage

);

router.post(

    "/admin/arsp/member/:id/reset-password",

    authMiddleware.isLoggedIn,

    adminArspController.resetPassword

);

//===========================
//ARSP DICUMENT VERIFICATION
//==========================


router.get(
    "/admin/arsp/document-verifications",
adminArspController.documentVerifications
);

module.exports = router;
