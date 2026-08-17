const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const SiteSetting = require("../models/SiteSetting");


// ===============================
// Show Login Page
// ===============================

exports.showLogin = async (req, res) => {

    try {

        const siteSettings =
            await SiteSetting.get();

        res.render("auth/login", {

            title: "Admin Login",

            error: null,

            siteSettings

        });

    } catch (err) {

        console.error(
            "Login Page Error:",
            err
        );

        res.render("auth/login", {

            title: "Admin Login",

            error: null,

            siteSettings: null

        });

    }

};


// ===============================
// Login
// ===============================

exports.login = async (req, res) => {

    try {

        const { username, password } = req.body;


        const user =
            await User.findByUsername(username);


        if (!user) {

            const siteSettings =
                await SiteSetting.get();

            return res.render("auth/login", {

                title: "Admin Login",

                error:
                    "Invalid username or password.",

                siteSettings

            });

        }


        const match =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!match) {

            const siteSettings =
                await SiteSetting.get();

            return res.render("auth/login", {

                title: "Admin Login",

                error:
                    "Invalid username or password.",

                siteSettings

            });

        }


        if (user.status !== "Active") {

            const siteSettings =
                await SiteSetting.get();

            return res.render("auth/login", {

                title: "Admin Login",

                error:
                    "Your account is inactive.",

                siteSettings

            });

        }


        // ===============================
        // Create Session
        // ===============================

        req.session.user = {

            id: user.id,

            username: user.username,

            role: user.role,

            reference_id:
                user.reference_id

        };


        // ===============================
        // Role Based Redirect
        // ===============================

        switch (user.role) {

            case "admin":

                return res.redirect("/admin/rtse");


            case "super_scanner":

                return res.redirect("/super-scanner");


            case "teacher":

                return res.redirect("/teacher");


            case "student":

                return res.redirect("/student");


            case "parent":

                return res.redirect("/parent");


            default:

                req.session.destroy(() => {

                    res.redirect(
                        "/admin/login"
                    );

                });

        }


    } catch (err) {

        console.error(
            "Login Error:",
            err
        );


        let siteSettings = null;

        try {

            siteSettings =
                await SiteSetting.get();

        } catch (settingsError) {

            console.error(
                "Login Settings Error:",
                settingsError
            );

        }


        return res.render(
            "auth/login",
            {

                title: "Admin Login",

                error:
                    "Something went wrong.",

                siteSettings

            }
        );

    }

};


// ===============================
// Logout
// ===============================

exports.logout = (req, res) => {

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    req.session.destroy((err) => {

        res.clearCookie("connect.sid", {
            path: "/"
        });

        if (err) {
            console.error("Admin logout session error:", err);
        }

        return res.redirect("/admin/login");
    });
};
