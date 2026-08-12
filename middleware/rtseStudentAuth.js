exports.isLoggedIn = (req, res, next) => {

    if (
        req.session &&
        req.session.rtseStudent
    ) {

        return next();

    }

    return res.redirect(
        "/rtse/student/login"
    );

};
