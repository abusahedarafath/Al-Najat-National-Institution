const adminModel = require("../models/adminModel");

// Show Login Page
exports.showLogin = (req, res) => {
    res.render("auth/admin-login", {
        title: "Admin Login"
    });
};

// Login
exports.login = (req, res) => {

    const { username, password } = req.body;

    adminModel.findByUsername(username, (err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        if (results.length === 0) {
            return res.send("Invalid Username");
        }

        const admin = results[0];

        if (admin.password !== password) {
            return res.send("Invalid Password");
        }

req.session.admin = {
    id: admin.id,
    username: admin.username,
    full_name: admin.full_name,
    role: admin.role
};

return res.redirect("/admin");

    });

};

// Logout
exports.logout = (req, res) => {

    req.session.destroy(() => {

        res.redirect("/admin/login");

    });

};
