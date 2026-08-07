exports.isLoggedIn = (req, res, next) => {

    if (req.session.user) {

        return next();

    }

    return res.redirect("/admin/login");

};

// =====================================
// Admin Authentication
// =====================================

exports.isAdmin = (req, res, next) => {

    // Not logged in
    if (!req.session.user) {

        return res.redirect("/admin/login");

    }

    // Logged in but not an admin
    if (req.session.user.role !== "admin") {

        return res.status(403).render("errors/403", {

            title: "Access Denied"

        });

    }

    // Admin authenticated
    return next();

};
