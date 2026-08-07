exports.isLoggedIn = (req, res, next) => {

    if (req.session && req.session.arspMember) {
        return next();
    }

    req.flash("error", "Please login first.");

    return res.redirect("/arsp/login");

};
