const db = require("../config/database");

class WebsiteVisitor {
    static async recordHeartbeat(visitorId, path) {
        const normalizedVisitorId = String(visitorId || "").trim();

        if (!normalizedVisitorId) {
            throw new Error("Visitor ID is required.");
        }

        const normalizedPath =
            String(path || "/").slice(0, 500);

        await db.query(
            `
            INSERT INTO website_visitors
                (visitor_id, first_seen_at, last_seen_at, last_path)
            VALUES
                (?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), ?)
            ON DUPLICATE KEY UPDATE
                last_seen_at = UTC_TIMESTAMP(),
                last_path = VALUES(last_path)
            `,
            [
                normalizedVisitorId,
                normalizedPath
            ]
        );

        await db.query(
            `
            INSERT INTO website_visitor_daily
                (visitor_id, visit_date, last_seen_at)
            VALUES
                (?, UTC_DATE(), UTC_TIMESTAMP())
            ON DUPLICATE KEY UPDATE
                last_seen_at = UTC_TIMESTAMP()
            `,
            [
                normalizedVisitorId
            ]
        );
    }

    static async getStatistics() {
        const [rows] = await db.query(
            `
            SELECT
                (
                    SELECT COUNT(*)
                    FROM website_visitor_daily
                    WHERE visit_date = UTC_DATE()
                ) AS today_visitors,

                (
                    SELECT COUNT(*)
                    FROM website_visitor_daily
                    WHERE visit_date >=
                        DATE_SUB(
                            UTC_DATE(),
                            INTERVAL (WEEKDAY(UTC_DATE()) + 7) DAY
                        )
                    AND visit_date <
                        DATE_SUB(
                            UTC_DATE(),
                            INTERVAL WEEKDAY(UTC_DATE()) DAY
                        )
                ) AS week_visitors,

                (
                    SELECT COUNT(*)
                    FROM website_visitor_daily
                    WHERE visit_date >=
                        DATE_FORMAT(
                            UTC_DATE() - INTERVAL 1 MONTH,
                            '%Y-%m-01'
                        )
                    AND visit_date <
                        DATE_FORMAT(
                            UTC_DATE(),
                            '%Y-%m-01'
                        )
                ) AS last_month_visitors,

                (
                    SELECT COUNT(*)
                    FROM website_visitors
                    WHERE last_seen_at >=
                        DATE_SUB(
                            UTC_TIMESTAMP(),
                            INTERVAL 15 SECOND
                        )
                ) AS live_visitors
            `
        );

        return rows[0] || {
            today_visitors: 0,
            week_visitors: 0,
            last_month_visitors: 0,
            live_visitors: 0
        };
    }
}

module.exports = WebsiteVisitor;
