exports.isStudentLoggedIn = (req, res, next) => {

    if (req.session && req.session.student) {
        return next();
    }

    return res.redirect("/student/login");

};
