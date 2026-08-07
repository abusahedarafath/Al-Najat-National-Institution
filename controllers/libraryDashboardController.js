const LibraryDashboard = require("../models/LibraryDashboard");

// ======================================
// Library Dashboard
// ======================================

exports.dashboard = async (req, res) => {

    try {

        const stats = await LibraryDashboard.getDashboardStats();

        const todayIssues =
            await LibraryDashboard.getTodayIssues();

        const todayReturns =
            await LibraryDashboard.getTodayReturns();

        const issueReport =
            await LibraryDashboard.getMonthlyIssueReport();

        const returnReport =
            await LibraryDashboard.getMonthlyReturnReport();

        res.render("admin/library-dashboard", {

            title: "Library Dashboard",

            stats,

            todayIssues,

            todayReturns,

            issueReport,

            returnReport

        });

    } catch (err) {

        console.error(err);

        res.status(500).send(err.stack);

    }

};
