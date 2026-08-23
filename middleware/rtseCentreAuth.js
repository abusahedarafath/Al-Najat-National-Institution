const RtseCentreAccount = require("../models/RtseCentreAccount");
const RtseCentre = require("../models/RtseCentre");

// =====================================
// RTSE Centre Authentication
// =====================================
exports.isCentreLoggedIn = async (req, res, next) => {
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const sessionCentre = req.session?.rtseCentre;

    console.log("\n===== CENTRE MIDDLEWARE SESSION DEBUG =====");
    console.log("Path:", req.originalUrl);
    console.log("Session ID:", req.sessionID);
    console.log("Session exists:", !!req.session);
    console.log("rtseCentre:", sessionCentre || null);

    if (
        !sessionCentre ||
        !sessionCentre.account_id ||
        !sessionCentre.centre_db_id
    ) {
        return res.redirect("/rtse/centre/login");
    }

    try {
        const account = await RtseCentreAccount.getByCentreId(
            sessionCentre.centre_db_id
        );

        console.log("Account lookup:", account ? {
            id: account.id,
            username: account.username,
            account_status: account.account_status,
            centre_status: account.centre_status,
            centre_id: account.centre_id
        } : null);

        if (!account) {
            console.log("CENTRE AUTH REJECT: account not found");
            req.session.rtseCentre = null;
            return res.redirect("/rtse/centre/login");
        }

        if (account.id !== sessionCentre.account_id) {
            console.log("CENTRE AUTH REJECT: account ID mismatch", {
                sessionAccountId: sessionCentre.account_id,
                databaseAccountId: account.id
            });
            req.session.rtseCentre = null;
            return res.redirect("/rtse/centre/login");
        }

        if (account.account_status !== "Active") {
            console.log("CENTRE AUTH REJECT: account status =", account.account_status);
            req.session.rtseCentre = null;
            return res.redirect("/rtse/centre/login");
        }

        if (account.centre_status !== "Approved") {
            console.log("CENTRE AUTH REJECT: centre status =", account.centre_status);
            req.session.rtseCentre = null;
            return res.redirect("/rtse/centre/login");
        }

        const centre = await RtseCentre.getById(
            account.centre_id
        );

        console.log("Centre lookup:", centre ? {
            id: centre.id,
            centre_id: centre.centre_id,
            centre_code: centre.centre_code,
            status: centre.status
        } : null);

        if (!centre || centre.status !== "Approved") {
            console.log("CENTRE AUTH REJECT: centre missing or not Approved");
            req.session.rtseCentre = null;
            return res.redirect("/rtse/centre/login");
        }

        req.centreAccount = account;
        req.centre = centre;

        console.log("CENTRE AUTH SUCCESS");
        return next();

    } catch (err) {
        console.error(
            "RTSE Centre Authentication Error:",
            err
        );

        req.session.rtseCentre = null;
        return res.redirect("/rtse/centre/login");
    }
};

// =====================================
// Require Password Change
// =====================================
exports.requirePasswordChanged = async (req, res, next) => {
    if (!req.session?.rtseCentre) {
        return res.redirect("/rtse/centre/login");
    }

    try {
        const account =
            req.centreAccount ||
            await RtseCentreAccount.getByCentreId(
                req.session.rtseCentre.centre_db_id
            );

        if (!account) {
            req.session.rtseCentre = null;
            return res.redirect("/rtse/centre/login");
        }

        if (account.force_password_change == 1) {
            return res.redirect("/rtse/centre/change-password");
        }

        return next();

    } catch (err) {
        console.error(
            "RTSE Centre Password Authentication Error:",
            err
        );

        req.session.rtseCentre = null;
        return res.redirect("/rtse/centre/login");
    }
};
