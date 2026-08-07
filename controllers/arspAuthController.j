const ArspAccount = require("../models/ArspAccount");
const ArspMember = require("../models/ArspMember");
const SiteSetting = require("../models/SiteSetting");




// =====================================
// Login Page
// =====================================

exports.loginPage = async (req, res) => {

    const site = await SiteSetting.get();

    res.render(

        "arsp/login",

        {

            title: "ARSP Member Login",

            site

        }

    );

};

// =====================================
// Login
// =====================================

exports.login = async (req, res) => {

    try {

        const { username, password } = req.body;

        const account = await ArspAccount.login(

            username,

            password

        );

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

        res.redirect("/arsp/dashboard");

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

    if (!req.session.arspMember) {

        return res.redirect("/arsp/login");

    }

    const member = await ArspMember.getById(

        req.session.arspMember.id

    );

    res.render(

        "arsp/dashboard",

        {

            title: "Member Dashboard",

            member

        }

    );

};

// =====================================
// Logout
// =====================================

exports.logout = (req, res) => {

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

    if (!req.session.arspMember) {

        return res.redirect("/arsp/login");

    }

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


// =====================================
// Change Password
// =====================================

exports.changePassword = async (req, res) => {

    try {

        if (!req.session.arspMember) {

            return res.redirect("/arsp/login");

        }

        const {

            current_password,

            new_password,

            confirm_password

        } = req.body;

        if (

            !current_password ||

            !new_password ||

            !confirm_password

        ) {

            req.flash(

                "error",

                "All fields are required."

            );

            return res.redirect("/arsp/change-password");

        }

        if (new_password !== confirm_password) {

            req.flash(

                "error",

                "New passwords do not match."

            );

            return res.redirect("/arsp/change-password");

        }

        if (new_password.length < 8) {

            req.flash(

                "error",

                "Password must be at least 8 characters."

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

        req.flash(

            "success",

            "Password changed successfully."

        );

        res.redirect("/arsp/dashboard");

    }

    catch (err) {

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
