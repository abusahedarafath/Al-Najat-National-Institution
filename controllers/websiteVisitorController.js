const WebsiteVisitor = require("../models/WebsiteVisitor");

function isValidVisitorId(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        String(value || "").trim()
    );
}

exports.heartbeat = async (req, res) => {
    try {
        const visitorId = String(
            req.body && req.body.visitorId || ""
        ).trim();

        const requestPath = String(
            req.body && req.body.path || "/"
        ).trim();

        if (!isValidVisitorId(visitorId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid visitor ID."
            });
        }

        await WebsiteVisitor.recordHeartbeat(
            visitorId,
            requestPath || "/"
        );

        return res.json({
            success: true
        });
    } catch (err) {
        console.error(
            "[Website Visitor] Heartbeat error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Unable to record visitor activity."
        });
    }
};

exports.statistics = async (req, res) => {
    try {
        const statistics =
            await WebsiteVisitor.getStatistics();

        return res.json({
            success: true,
            statistics: {
                last_month: Number(
                    statistics.last_month_visitors || 0
                ),
                last_week: Number(
                    statistics.week_visitors || 0
                ),
                today: Number(
                    statistics.today_visitors || 0
                ),
                live: Number(
                    statistics.live_visitors || 0
                )
            }
        });
    } catch (err) {
        console.error(
            "[Website Visitor] Statistics error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load visitor statistics."
        });
    }
};
