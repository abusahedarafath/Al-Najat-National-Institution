const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// =====================================
// Permanent Admin Recovery URL
// =====================================
exports.showRecovery = async (req, res) => {

    try {

        const admin = await User.getActiveAdmin();

        if (!admin) {

            return res.status(404).send(
                "No active administrator account found."
            );

        }

        res.render(
            "auth/admin-recovery",
            {
                title: "Admin Account Recovery",
                error: null,
                success: null
            }
        );

    } catch (error) {

        console.error(
            "Admin Recovery Page Error:",
            error
        );

        res.status(500).send(
            "Unable to open Admin Recovery."
        );
    }
};


// =====================================
// Replace Admin Credentials
// =====================================
exports.resetAdmin = async (req, res) => {

    try {

        const {
            username,
            password,
            confirmPassword
        } = req.body;

        // ---------------------------------
        // Basic validation
        // ---------------------------------
        if (
            !username ||
            !password ||
            !confirmPassword
        ) {

            return res.status(400).render(
                "auth/admin-recovery",
                {
                    title: "Admin Account Recovery",
                    error: "All fields are required.",
                    success: null
                }
            );

        }

        const newUsername = username.trim();

        // ---------------------------------
        // Username validation
        // ---------------------------------
        if (
            newUsername.length < 4 ||
            newUsername.length > 100
        ) {

            return res.status(400).render(
                "auth/admin-recovery",
                {
                    title: "Admin Account Recovery",
                    error: "Admin ID must be between 4 and 100 characters.",
                    success: null
                }
            );

        }

        // ---------------------------------
        // Password validation
        // ---------------------------------
        if (password.length < 8) {

            return res.status(400).render(
                "auth/admin-recovery",
                {
                    title: "Admin Account Recovery",
                    error: "Password must contain at least 8 characters.",
                    success: null
                }
            );

        }

        // ---------------------------------
        // Confirm password
        // ---------------------------------
        if (password !== confirmPassword) {

            return res.status(400).render(
                "auth/admin-recovery",
                {
                    title: "Admin Account Recovery",
                    error: "Passwords do not match.",
                    success: null
                }
            );

        }

        // ---------------------------------
        // Find current admin
        // ---------------------------------
        const oldAdmin = await User.getActiveAdmin();

        if (!oldAdmin) {

            return res.status(404).render(
                "auth/admin-recovery",
                {
                    title: "Admin Account Recovery",
                    error: "No active administrator account found.",
                    success: null
                }
            );

        }

        // ---------------------------------
        // Prevent same Admin ID
        // ---------------------------------
        if (
            newUsername.toLowerCase() ===
            oldAdmin.username.toLowerCase()
        ) {

            return res.status(400).render(
                "auth/admin-recovery",
                {
                    title: "Admin Account Recovery",
                    error: "The new Admin ID must be different from the previous Admin ID.",
                    success: null
                }
            );

        }

        // ---------------------------------
        // Replace credentials
        // ---------------------------------
        const result =
            await User.replaceAdminCredentials(
                oldAdmin.id,
                newUsername,
                password
            );

        console.log(
            "Admin credentials replaced:",
            result.oldUsername,
            "→",
            result.newUsername
        );

        // ---------------------------------
        // Success
        // ---------------------------------
        return res.render(
            "auth/admin-recovery-success",
            {
                title: "Admin Recovery Successful",
                username: result.newUsername
            }
        );

    } catch (error) {

        console.error(
            "Admin Recovery Error:",
            error
        );

        return res.status(400).render(
            "auth/admin-recovery",
            {
                title: "Admin Account Recovery",
                error: error.message ||
                    "Unable to change administrator credentials.",
                success: null
            }
        );
    }
};
