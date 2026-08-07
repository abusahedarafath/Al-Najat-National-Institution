const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// ===============================
// Show Login Page
// ===============================
exports.showLogin = (req, res) => {
    res.render("auth/login", {
        title: "Admin Login",
        error: null
    });
};

// ===============================
// Login
// ===============================
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findByUsername(username);

        if (!user) {
            return res.render("auth/login", {
                title: "Admin Login",
                error: "Invalid username or password."
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.render("auth/login", {
                title: "Admin Login",
                error: "Invalid username or password."
            });
        }

        if (user.status !== "Active") {
            return res.render("auth/login", {
                title: "Admin Login",
                error: "Your account is inactive."
            });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            reference_id: user.reference_id
        };

        switch (user.role) {
            case "admin":
                return res.redirect("/admin");

            case "teacher":
                return res.redirect("/teacher");

            case "student":
                return res.redirect("/student");

            case "parent":
                return res.redirect("/parent");

            default:
                req.session.destroy(() => {
                    res.redirect("/admin/login");
                });
        }

    } catch (err) {
        console.error("Login Error:", err);

        return res.render("auth/login", {
            title: "Admin Login",
            error: "Something went wrong."
        });
    }
};

// ===============================
// Logout
// ===============================
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/login");
    });
};
