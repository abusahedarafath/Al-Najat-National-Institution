const ArspSchoolAccount = require("../models/ArspSchoolAccount");
const ArspSchool = require("../models/ArspSchool");

exports.isSchoolLoggedIn = async (req, res, next) => {
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const sessionSchool = req.session.arspSchool;

    if (!sessionSchool || !sessionSchool.account_id || !sessionSchool.school_id) {
        return res.redirect("/arsp/school/login");
    }

    try {
        const account = await ArspSchoolAccount.getByUsername(
            sessionSchool.username
        );

        if (!account) {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        if (account.id !== sessionSchool.account_id) {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        if (account.school_id !== sessionSchool.school_id) {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        if (account.account_status !== "Active") {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        const school = await ArspSchool.getById(account.school_id);

        if (!school || school.status !== "Approved") {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        req.schoolAccount = account;
        req.school = school;

        return next();
    } catch (err) {
        console.error("ARSP School Authentication Error:", err);
        req.session.arspSchool = null;
        return res.redirect("/arsp/school/login");
    }
};

exports.requirePasswordChanged = async (req, res, next) => {
    if (!req.session.arspSchool) {
        return res.redirect("/arsp/school/login");
    }

    try {
        const account = req.schoolAccount ||
            await ArspSchoolAccount.getBySchoolId(
                req.session.arspSchool.school_id
            );

        if (!account) {
            req.session.arspSchool = null;
            return res.redirect("/arsp/school/login");
        }

        if (account.force_password_change == 1) {
            return res.redirect("/arsp/school/change-password");
        }

        return next();
    } catch (err) {
        console.error("ARSP School Password Authentication Error:", err);
        req.session.arspSchool = null;
        return res.redirect("/arsp/school/login");
    }
};
