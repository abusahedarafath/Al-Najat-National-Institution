const User = require("../models/userModel");

// =====================================
// Logged In Authentication
// =====================================
exports.isLoggedIn = async (req, res, next) => {

    if (!req.session.user) {
        return res.redirect("/admin/login");
    }

    return next();
};


// =====================================
// Admin Authentication
// =====================================
exports.isAdmin = async (req, res, next) => {

    // ---------------------------------
    // Not logged in
    // ---------------------------------
    if (!req.session.user) {
        return res.redirect("/admin/login");
    }

    // ---------------------------------
    // Session role check
    // ---------------------------------
    if (req.session.user.role !== "admin") {

        return res.status(403).render("errors/403", {
            title: "Access Denied"
        });

    }

    try {

        // ---------------------------------
        // Verify current database status
        // ---------------------------------
        const user = await User.findById(
            req.session.user.id
        );

        // User no longer exists
        if (!user) {

            return req.session.destroy(() => {
                res.redirect("/admin/login");
            });

        }

        // User has been deactivated
        if (
            user.status !== "Active" ||
            user.role !== "admin"
        ) {

            return req.session.destroy(() => {
                res.redirect("/admin/login");
            });

        }

        return next();

    } catch (error) {

        console.error(
            "Admin Authentication Error:",
            error
        );

        return res.status(500).send(
            "Authentication error."
        );
    }
};
