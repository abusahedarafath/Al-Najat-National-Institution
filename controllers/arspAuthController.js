const ArspAccount = require("../models/ArspAccount");

const ArspMember = require("../models/ArspMember");
const SiteSetting = require("../models/SiteSetting");
const ArspSetting = require("../models/ArspSetting"); 
const IdentityCardSetting = require("../models/IdentityCardSetting");

const Notice = require("../models/Notice");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const ArspActivityLog = require("../models/ArspActivityLog");
const ArspManagementPosition = require("../models/ArspManagementPosition");
const ArspDocumentVerification = require("../models/ArspDocumentVerification");
const generateQRCode = require("../utils/qrGenerator");

const generateIdCard = require("../utils/arspIdCardPdf");



// =====================================
// Login Page
// =====================================

exports.loginPage = async (req, res) => {

    const site = await SiteSetting.get();
    const arsp = await ArspSetting.get();
    res.render(

        "arsp/login",

        {

            title: "ARSP Member Login",

            site,
           arsp

        }

    );

};

// =====================================
// Login
// =====================================

exports.login = async (req, res) => {

    try {

        const { username, password } = req.body;
       console.log("Username:", username);
console.log("Password:", password);
        const account = await ArspAccount.login(

            username,

            password

        );

console.log("Account:", account);

        if (!account) {

            req.flash(

                "error",

                "Invalid Username or Password."

            );

            return res.redirect("/arsp/login");

        }

        const member = await ArspMember.getById(

            account.member_id

        );


console.log("1. Starting download");

        if (!member) {

            req.flash(

                "error",

                "Member account not found."

            );

            return res.redirect("/arsp/login");

        }

        if (member.status !== "Active") {

            req.flash(

                "error",

                "Your account is inactive."

            );

            return res.redirect("/arsp/login");

        }

       req.session.arspMember = {

    id: member.id,

    member_id: member.member_id,

    name: member.full_name

};


await ArspActivityLog.create(

    member.id,

    "Logged in",

    req.ip

);

// Force password change after admin reset
if (account.force_password_change == 1) {

    return res.redirect("/arsp/change-password");

}

// Normal Login
return res.redirect("/arsp/dashboard");

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Login failed."

        );

        res.redirect("/arsp/login");

    }

};

// =====================================
// Dashboard
// =====================================

exports.dashboard = async (req, res) => {



    try {


const member = await ArspMember.getById(
    req.session.arspMember.id
);

const notices = await Notice.getLatest(5);

const position =
    await ArspManagementPosition.getByMemberId(
        member.id
    );

res.render(
    "arsp/dashboard",
    {
        title: "Member Dashboard",
        member,
        notices,
        position,
        hasAppointment: !!position
    }
);


    } catch (err) {

        console.error(err);

        res.redirect("/arsp/login");

    }

};




// =====================================
// Download Digital ID Card PDF
// =====================================

exports.downloadIdCard = async (req, res) => {
    try {

        // =====================================================
        // ALWAYS LOAD THE LATEST MEMBER DATA FROM DATABASE
        // Never use stale session/profile data for the ID card.
        // =====================================================

        const memberId = req.session.arspMember.id;

        // Prevent browser / Android WebView from reusing an old PDF
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        const member = await ArspMember.getById(memberId);

        if (!member) {
            return res.status(404).send("Member not found.");
        }

        // =====================================================
        // LOAD CURRENT MANAGEMENT POSITION
        // =====================================================

        const position =
            await ArspManagementPosition.getByMemberId(member.id);

        // Add the current position information to the member
        // object used by the PDF generator.

        if (position) {

            member.designation =
                position.designation || position.section || "ARSP Member";

            member.section =
                position.section || "-";

            member.committee =
                position.committee_name || "-";

        } else {

            member.designation = "ARSP Member";
            member.section = "-";
            member.committee = "-";

        }

        // =====================================================
        // LOAD LATEST ARSP SETTINGS
        // =====================================================

        const arspSettings =
            await ArspSetting.get();

        // =====================================================
        // LOAD LATEST ID CARD SETTINGS
        // =====================================================

        const cardSettings =
            await IdentityCardSetting.get();

        // =====================================================
        // GENERATE ID CARD USING FRESH DATABASE DATA
        // =====================================================

        return generateIdCard(
            member,
            arspSettings,
            cardSettings,
            res
        );

    } catch (err) {

        console.error("❌ Member ID Card Error:", err);

        if (!res.headersSent) {
            return res.status(500).send(
                "Unable to generate PDF."
            );
        }
    }
};




// =====================================
// Activity Log
// =====================================

exports.activity = async (req, res) => {



    try {

        const member = await ArspMember.getById(

            req.session.arspMember.id

        );

        const activities = await ArspActivityLog.getByMember(

            member.id

        );

        res.render(

            "arsp/activity",

            {

                title: "My Activity",

                member,

                activities

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load activity."

        );

        res.redirect("/arsp/dashboard");

    }

};






// =====================================
// Logout
// =====================================

exports.logout = async (req, res) => {

    if (req.session.arspMember) {

        await ArspActivityLog.create(

            req.session.arspMember.id,

            "Logged out",

            req.ip

        );

    }

    req.session.destroy(() => {

        res.redirect("/arsp/login");

    });

};

// =====================================
// Placeholder Methods
// =====================================

// =====================================
// Change Password Page
// =====================================

exports.changePasswordPage = async (req, res) => {



    const member = await ArspMember.getById(

        req.session.arspMember.id

    );

    res.render(

        "arsp/change-password",

        {

            title: "Change Password",

            member

        }

    );

};



//CHANGE PASSWORD

exports.changePassword = async (req, res) => {



    try {

        const {

            current_password,

            new_password,

            confirm_password

        } = req.body;

        if (new_password !== confirm_password) {

            req.flash(

                "error",

                "New password and confirmation password do not match."

            );

            return res.redirect("/arsp/change-password");

        }

        const account = await ArspAccount.login(

            req.session.arspMember.member_id,

            current_password

        );

        if (!account) {

            req.flash(

                "error",

                "Current password is incorrect."

            );

            return res.redirect("/arsp/change-password");

        }

        await ArspAccount.updatePassword(

            account.id,

            new_password

        );



await ArspAccount.clearPasswordChange(
    account.member_id
);

await ArspActivityLog.create(

    req.session.arspMember.id,

    "Password changed",

    req.ip

);




        req.flash(

            "success",

            "Password changed successfully."

        );

        res.redirect("/arsp/dashboard");

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to change password."

        );

        res.redirect("/arsp/change-password");

    }

};



exports.forgotPasswordPage = (req, res) => {

    res.send("Forgot Password");

};

exports.sendOTP = (req, res) => {

    res.send("Send OTP");

};

exports.verifyOtpPage = (req, res) => {

    res.send("Verify OTP");

};

exports.verifyOTP = (req, res) => {

    res.send("Verify OTP");

};

exports.resetPasswordPage = (req, res) => {

    res.send("Reset Password");

};

exports.resetPassword = (req, res) => {

    res.send("Reset Password");

};




// =====================================
// MEMBER REGISTRATION SLIP
// =====================================

exports.registrationSlip = async (req, res) => {

    try {

        const setting =
            await ArspSetting.get();

        const member =
            await ArspMember.getByMemberId(
                req.session.arspMember.member_id
            );

        res.render(
            "arsp-documents/membership-registration-slip",
            {
                title: "Membership Registration Slip",
                setting,
                member,
                registrationSource: "Member Portal"
            }
        );

    } catch (err) {

        console.error(err);

        res.send("<pre>" + err.stack + "</pre>");

    }

};




// =====================================
// MEMBER REGISTRATION SLIP
// =====================================

exports.registrationSlip = async (req, res) => {

    try {

        const setting = await ArspSetting.get();

        const member = await ArspMember.getByMemberId(
            req.session.arspMember.member_id
        );

        res.render(
            "arsp-documents/membership-registration-slip",
            {
                title: "Membership Registration Slip",
                setting,
                member,
                registrationSource: "Member Portal"
            }
        );

    } catch (err) {

        console.error(err);

        res.send("<pre>" + err.stack + "</pre>");

    }

};




// =====================================
// APPOINTMENT LETTER
// =====================================

exports.appointmentLetter = async (req, res) => {

    try {

        const setting =
            await ArspSetting.get();

        const member =
            await ArspMember.getByMemberId(
                req.session.arspMember.member_id
            );

        if (!member) {

            req.flash(
                "error",
                "Member not found."
            );

            return res.redirect("/arsp/dashboard");

        }

        const position =
            await ArspManagementPosition.getByMemberId(
                member.id
            );

        if (!position) {

            req.flash(
                "error",
                "No appointment has been assigned to your account yet."
            );

            return res.redirect("/arsp/dashboard");

        }

        // ==========================
        // Document Number
        // ==========================

        const documentNumber =
            `ARSP-APPT-${new Date(position.appointed_at).getFullYear()}-${member.member_id}`;

        // ==========================
        // Create Verification Record
        // ==========================

        let verification =
            await ArspDocumentVerification.getByDocumentNumber(
                documentNumber
            );

        if (!verification) {

            await ArspDocumentVerification.create({

                member_id: member.id,

                document_type: "Appointment Letter",

                document_number: documentNumber,

                issue_date: position.appointed_at,

                status: "Valid"

            });

        }

        // ==========================
        // Generate Appointment QR
        // ==========================

        const appointmentQR =
            await generateQRCode(

                documentNumber,

                `${req.protocol}://${req.get("host")}/arsp/document/verify/${documentNumber}`

            );

        res.render(
            "arsp-documents/appointment-letter",
            {

                title: "Appointment Letter",

                setting,

                member,

                position,

                documentNumber,

                appointmentQR

            }

        );

    } catch (err) {

        console.error(err);

        res.send("<pre>" + err.stack + "</pre>");

    }

};









