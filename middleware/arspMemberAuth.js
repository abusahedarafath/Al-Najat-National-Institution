module.exports = (req, res, next) => {

    if (!req.session.arspMember) {

        return res.redirect("/arsp/login");

    }

    next();

};
