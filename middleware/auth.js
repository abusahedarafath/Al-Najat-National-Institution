const User = require("../models/userModel");

// =====================================
// Logged In Authentication
// =====================================
exports.isLoggedIn = async (req, res, next) => {

    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    console.log("SUPER SCANNER SESSION:", req.session.user);

    if (!req.session.user) {
        console.log("SUPER SCANNER: NO SESSION");
        return res.redirect("/admin/login");
    }

    return next();
};


// =====================================
// Admin Authentication
// =====================================
exports.isAdmin = async (req, res, next) => {

    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

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


// =====================================
// Super Scanner Authentication
// =====================================
exports.isSuperScanner = async (req, res, next) => {

    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // ---------------------------------
    // Not logged in
    // ---------------------------------
    if (!req.session.user) {
        return res.redirect("/admin/login");
    }

    // ---------------------------------
    // Session role check
    // ---------------------------------
    if (req.session.user.role !== "super_scanner") {
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

        // ---------------------------------
        // Account must remain active
        // ---------------------------------
        if (
            user.status !== "Active" ||
            user.role !== "super_scanner"
        ) {
            return req.session.destroy(() => {
                res.redirect("/admin/login");
            });
        }

        return next();

    } catch (error) {

        console.error(
            "Super Scanner Authentication Error:",
            error
        );

        return res.status(500).send(
            "Authentication error."
        );
    }
};
