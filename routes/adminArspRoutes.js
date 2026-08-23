const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

router.use("/admin", authMiddleware.isAdmin);


const createUploader = require("../middleware/uploadFactory");

const upload = createUploader("arsp-members");

const processArspMemberPhoto = require("../middleware/processArspMemberPhoto");
const adminArspController = require("../controllers/adminArspController");

const adminArspSchoolController = require("../controllers/adminArspSchoolController");
const adminRtseCentreController = require("../controllers/adminRtseCentreController");



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





// ======================================
// RTSE CENTRE REGISTRY
// ======================================

router.get(
    "/admin/arsp/centres",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.index
);

router.get(
    "/admin/arsp/centres/add",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.addPage
);

router.post(
    "/admin/arsp/centres/add",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.create
);

router.get(
    "/admin/arsp/centre/:id",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.view
);

// ======================================
// RTSE CENTRE SCHOOL ASSIGNMENTS
// ======================================

router.get(
    "/admin/arsp/centre/:id/school-assignment/:assignmentId/view",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.viewSchoolAssignment
);

router.post(
    "/admin/arsp/centre/:id/school-assignment/:assignmentId/approve",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.approveSchoolAssignment
);

router.post(
    "/admin/arsp/centre/:id/school-assignment/:assignmentId/reject",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.rejectSchoolAssignment
);

router.get(
    "/admin/arsp/centre/:id/edit",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.editPage
);

router.post(
    "/admin/arsp/centre/:id/edit",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.update
);

router.post(
    "/admin/arsp/centre/:id/approve",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.approve
);

router.post(
    "/admin/arsp/centre/:id/reject",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.reject
);

router.post(
    "/admin/arsp/centre/:id/deactivate",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.deactivate
);

router.post(
    "/admin/arsp/centre/:id/activate",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.activate
);

router.post(
    "/admin/arsp/centre/:id/suspend",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.suspend
);

// ======================================
// RTSE CENTRE PORTAL ACCOUNT MANAGEMENT
// ======================================
router.post(
    "/admin/arsp/centre/:id/account/create",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.createAccount
);

router.post(
    "/admin/arsp/centre/:id/account/reset-password",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.resetAccountPassword
);

// ======================================
// Centre Portal Credential Slip
// ======================================
router.get(
    "/admin/arsp/centre/:id/credential-slip",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.credentialSlip
);

router.post(
    "/admin/arsp/centre/:id/credential-slip/close",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.closeCredentialSlip
);


router.post(
    "/admin/arsp/centre/:id/account/activate",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.activateAccount
);

router.post(
    "/admin/arsp/centre/:id/account/deactivate",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.deactivateAccount
);

router.post(
    "/admin/arsp/centre/:id/account/suspend",
    authMiddleware.isLoggedIn,
    adminRtseCentreController.suspendAccount
);


// ======================================
// ARSP SCHOOL REGISTRY
// ======================================

router.get(
    "/admin/arsp/schools",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.index
);

router.get(
    "/admin/arsp/schools/add",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.addPage
);

router.post(
    "/admin/arsp/schools/add",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.create
);

router.get(
    "/admin/arsp/school/:id",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.view
);

router.get(
    "/admin/arsp/school/:id/edit",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.editPage
);

router.post(
    "/admin/arsp/school/:id/edit",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.update
);

router.post(
    "/admin/arsp/school/:id/approve",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.approve
);

router.post(
    "/admin/arsp/school/:id/reject",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.reject
);

router.post(
    "/admin/arsp/school/:id/deactivate",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.deactivate
);

router.post(
    "/admin/arsp/school/:id/activate",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.activate
);





// ======================================
// Reset School Portal Password
// ======================================

router.post(
    "/admin/arsp/school/:id/reset-password",
    authMiddleware.isLoggedIn,
    adminArspSchoolController.resetPortalPassword
);

module.exports = router;
