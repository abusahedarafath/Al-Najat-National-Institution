const RtseRecords = require("../models/RtseRecords");

exports.recordsDashboard = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const year = String(req.query.year || "").trim();
        const centreId = String(req.query.centre || "").trim();

        const [years, centres, dashboard] = await Promise.all([
            RtseRecords.getYears(),
            RtseRecords.getCentres(year),
            RtseRecords.getDashboardData({
                search,
                year,
                centreId
            })
        ]);

        let drilldown = null;

        const drillSection = String(req.query.section || "").trim().toUpperCase();
        const drillSchoolId = String(req.query.school_id || "").trim();
        const drillAttendance = String(req.query.attendance || "").trim().toUpperCase();

        if (
            ["A", "B", "C", "D", "E"].includes(drillSection) ||
            /^\d+$/.test(drillSchoolId)
        ) {
            const students = await RtseRecords.getDrilldownStudents({
                search,
                year,
                centreId,
                section: drillSection,
                schoolId: drillSchoolId,
                attendance: drillAttendance
            });

            drilldown = {
                students,
                section: drillSection || null,
                schoolId: drillSchoolId || null,
                attendance: drillAttendance || null
            };
        }

        return res.render("admin/rtse/records", {
            title: "RTSE Records Dashboard",
            years,
            centres,
            dashboard,
            filters: {
                search,
                year,
                centreId
            },
            drilldown
        });
    } catch (error) {
        console.error("RTSE Records Dashboard error:", error);

        return res.status(500).render("error", {
            message: "Unable to load RTSE Records Dashboard."
        });
    }
};

exports.recordsSectionDashboard = async (req, res) => {
    try {
        const section = String(req.params.section || "").trim().toUpperCase();

        if (!["A", "B", "C", "D", "E"].includes(section)) {
            return res.status(404).render("error", {
                message: "Invalid RTSE section."
            });
        }

        const search = String(req.query.search || "").trim();
        const year = String(req.query.year || "").trim();
        const centreId = String(req.query.centre || "").trim();

        const attendance = String(req.query.attendance || "")
            .trim()
            .toUpperCase();

        if (!["PRESENT", "ABSENT"].includes(attendance)) {
            return res.status(400).render("error", {
                message: "Invalid attendance filter."
            });
        }

        const [years, centres, students] = await Promise.all([
            RtseRecords.getYears(),
            RtseRecords.getCentres(year),
            RtseRecords.getDrilldownStudents({
                search,
                year,
                centreId,
                section,
                attendance
            })
        ]);

        return res.render("admin/rtse/records-section", {
            title: `RTSE Records — Section ${section} — ${attendance}`,
            section,
            attendance,
            years,
            centres,
            students,
            filters: {
                search,
                year,
                centreId
            }
        });
    } catch (error) {
        console.error("RTSE Records Section error:", error);

        return res.status(500).render("error", {
            message: "Unable to load RTSE section records."
        });
    }
};

exports.recordsSchoolDashboard = async (req, res) => {
    try {
        const schoolId = String(req.params.schoolId || "").trim();

        if (!/^\d+$/.test(schoolId)) {
            return res.status(404).render("error", {
                message: "Invalid RTSE school."
            });
        }

        const search = String(req.query.search || "").trim();
        const year = String(req.query.year || "").trim();
        const centreId = String(req.query.centre || "").trim();

        const [years, centres, students] = await Promise.all([
            RtseRecords.getYears(),
            RtseRecords.getCentres(year),
            RtseRecords.getDrilldownStudents({
                search,
                year,
                centreId,
                schoolId
            })
        ]);

        const schoolName =
            students.length && students[0].school_name
                ? students[0].school_name
                : `School ${schoolId}`;

        return res.render("admin/rtse/records-school", {
            title: `RTSE Records — ${schoolName}`,
            schoolId,
            schoolName,
            years,
            centres,
            students,
            filters: {
                search,
                year,
                centreId
            }
        });
    } catch (error) {
        console.error("RTSE Records School error:", error);

        return res.status(500).render("error", {
            message: "Unable to load RTSE school records."
        });
    }
};

exports.recordsData = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const year = String(req.query.year || "").trim();
        const centreId = String(req.query.centre || "").trim();

        const dashboard = await RtseRecords.getDashboardData({
            search,
            year,
            centreId
        });

        return res.json({
            success: true,
            ...dashboard
        });
    } catch (error) {
        console.error("RTSE Records data error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load RTSE records."
        });
    }
};

exports.recordsCentres = async (req, res) => {
    try {
        const year = String(req.query.year || "").trim();

        const centres = await RtseRecords.getCentres(year);

        return res.json({
            success: true,
            centres
        });
    } catch (error) {
        console.error("RTSE Records centres error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load centres."
        });
    }
};
