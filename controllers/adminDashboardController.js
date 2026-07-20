const admissionModel = require("../models/admissionModel");

// ===============================
// Admin Dashboard
// ===============================
exports.dashboard = (req, res) => {

    admissionModel.getDashboardStats((err, statsResult) => {

        if (err) {
            console.error(err);
            return res.send("Database Error");
        }

        admissionModel.getRecentApplications((err, recentResult) => {

            if (err) {
                console.error(err);
                return res.send("Database Error");
            }

            res.render("admin/dashboard", {
                stats: statsResult[0],
                recentApplications: recentResult
            });

        });

    });

};
