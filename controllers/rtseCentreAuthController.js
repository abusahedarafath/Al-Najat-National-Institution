const RtseCentreAccount = require("../models/RtseCentreAccount");

// =====================================
// Centre Login Page
// =====================================
exports.loginPage = (req, res) => {
    if (req.session?.rtseCentre) {
        return res.redirect("/rtse/centre/dashboard");
    }

    return res.render("rtse/centre/login", {
        title: "RTSE Centre Portal Login"
    });
};

// =====================================
// Centre Login
// =====================================
exports.login = async (req, res) => {
    try {
        const username = String(req.body.username || "").trim();
        const password = req.body.password || "";

        if (!username || !password) {
            req.flash("error", "Username and password are required.");
            return res.redirect("/rtse/centre/login");
        }

        const account = await RtseCentreAccount.login(
            username,
            password
        );

        if (!account) {
            req.flash("error", "Invalid Centre username or password.");
            return res.redirect("/rtse/centre/login");
        }

        await RtseCentreAccount.updateLastLogin(account.id);

        console.log("\n===== CENTRE LOGIN SESSION DEBUG =====");
        console.log("Account ID:", account.id);
        console.log("Centre Login ID:", account.centre_public_id);
        console.log("Centre DB ID:", account.centre_id);
        console.log("Force Password Change:", account.force_password_change);
        console.log("Session ID before assignment:", req.sessionID);
        console.log("Session before assignment:", req.session?.rtseCentre || null);

        // Keep Centre authentication completely separate
        // from admin, school and student sessions.
        req.session.rtseCentre = {
            account_id: account.id,
            centre_db_id: account.centre_id,
            centre_id: account.centre_id,
            centre_code: account.centre_code,
            centre_name: account.centre_name,
            centre_type: account.centre_type,
            username: account.centre_public_id
        };

        console.log("Assigned rtseCentre:", req.session.rtseCentre);
        console.log("Session ID before save:", req.sessionID);

        return req.session.save((sessionError) => {
            if (sessionError) {
                console.error("RTSE Centre Session Save Error:", sessionError);
                req.session.rtseCentre = null;
                req.flash("error", "Unable to start Centre session.");
                return res.redirect("/rtse/centre/login");
            }

            console.log("Session saved successfully.");
            console.log("Saved session ID:", req.sessionID);
            console.log("Saved rtseCentre:", req.session.rtseCentre);

            if (account.force_password_change == 1) {
                console.log("Redirecting to /rtse/centre/change-password");
                return res.redirect("/rtse/centre/change-password");
            }

            return res.redirect("/rtse/centre/dashboard");
        });

    } catch (err) {
        console.error("RTSE Centre Login Error:", err);
        req.flash("error", "Unable to login to Centre Portal.");
        return res.redirect("/rtse/centre/login");
    }
};

// =====================================
// Change Password Page
// =====================================
exports.changePasswordPage = async (req, res) => {
    try {
        return res.render("rtse/centre/change-password", {
            title: "Change Centre Password",
            centre: req.session.rtseCentre
        });
    } catch (err) {
        console.error("RTSE Centre Change Password Page Error:", err);
        return res.status(500).send("Unable to load password page.");
    }
};

// =====================================
// Change Password
// =====================================
exports.changePassword = async (req, res) => {
    try {
        const sessionCentre = req.session?.rtseCentre;

        if (!sessionCentre?.account_id) {
            return res.redirect("/rtse/centre/login");
        }

        const newPassword = req.body.new_password || "";
        const confirmPassword = req.body.confirm_password || "";

        if (!newPassword || !confirmPassword) {
            req.flash("error", "Both password fields are required.");
            return res.redirect("/rtse/centre/change-password");
        }

        if (newPassword.length < 8) {
            req.flash(
                "error",
                "Password must contain at least 8 characters."
            );
            return res.redirect("/rtse/centre/change-password");
        }

        if (newPassword !== confirmPassword) {
            req.flash("error", "Passwords do not match.");
            return res.redirect("/rtse/centre/change-password");
        }

        await RtseCentreAccount.updatePassword(
            sessionCentre.account_id,
            newPassword
        );

        req.flash(
            "success",
            "Password changed successfully."
        );

        return res.redirect("/rtse/centre/dashboard");

    } catch (err) {
        console.error("RTSE Centre Change Password Error:", err);
        req.flash("error", "Unable to change password.");
        return res.redirect("/rtse/centre/change-password");
    }
};

// =====================================
// Logout
// =====================================
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("RTSE Centre Logout Error:", err);
        }

        res.clearCookie("connect.sid");
        return res.redirect("/rtse/centre/login");
    });
};
