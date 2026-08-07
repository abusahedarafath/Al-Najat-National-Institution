const admissionModel = require("../models/admissionModel");

// ===============================
// Admin Dashboard
// ===============================

exports.dashboard = async (req, res) => {

    try {

        const stats = await admissionModel.getDashboardStats();
        const recentApplications = await admissionModel.getRecentApplications();

        res.render("admin/dashboard", {

            totalApplications: stats.total || 0,
            pendingApplications: stats.pending || 0,
            approvedApplications: stats.approved || 0,
            rejectedApplications: stats.rejected || 0,
            recentApplications

        });

    } catch (err) {

        console.error("Dashboard Error:", err);
        res.status(500).send(err.stack);

    }

};
