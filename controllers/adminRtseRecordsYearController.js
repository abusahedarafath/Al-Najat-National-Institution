const RtseRecordsYear = require("../models/RtseRecordsYear");

exports.recordsYears = async (req, res) => {
    try {
        const years = await RtseRecordsYear.getYears();

        const activeYearRow = years.find(
            row => Number(row.is_active_operational_year) === 1
        );

        res.render("admin/rtse/records-years", {
            title: "RTSE Records Year Manager",
            years,
            activeOperationalYear: activeYearRow
                ? Number(activeYearRow.application_year)
                : null,
            successMessages: req.flash("success"),
            errorMessages: req.flash("error")
        });
    } catch (err) {
        console.error("RTSE Records Year Manager:", err);

        req.flash(
            "error",
            err.message || "Unable to load Records Year Manager."
        );

        res.redirect("/admin/rtse/records");
    }
};

exports.finishYear = async (req, res) => {
    try {
        const year = Number(req.params.year);

        await RtseRecordsYear.finishYear(year);

        req.flash(
            "success",
            `RTSE ${year} has been successfully finished. Its operational data has been moved to Records DB.`
        );
    } catch (err) {
        console.error("RTSE Finish Year:", err);

        req.flash(
            "error",
            err.message || "Unable to finish the RTSE year."
        );
    }

    res.redirect("/admin/rtse/records/years");
};

exports.reopenYear = async (req, res) => {
    try {
        const year = Number(req.params.year);

        await RtseRecordsYear.reopenYear(year);

        req.flash(
            "success",
            `RTSE ${year} has been reopened successfully. Its operational data has been restored, and its historical Records DB data has been removed.`
        );
    } catch (err) {
        console.error("RTSE Reopen Year:", err);

        req.flash(
            "error",
            err.message || "Unable to reopen the RTSE year."
        );
    }

    res.redirect("/admin/rtse/records/years");
};
