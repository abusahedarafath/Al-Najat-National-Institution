const admissionModel = require("../models/admissionModel");

// ===============================
// Admin Dashboard
// ===============================
exports.dashboard = (req, res) => {

    admissionModel.getDashboardStats((err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        const stats = results && results.length ? results[0] : {};

        res.render("admin/dashboard", {
            totalApplications: stats.total || 0,
            pendingApplications: stats.pending || 0,
            approvedApplications: stats.approved || 0,
            rejectedApplications: stats.rejected || 0
        });

    });

};
