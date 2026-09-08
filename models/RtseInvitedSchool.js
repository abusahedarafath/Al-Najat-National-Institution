const db = require("../config/database");

class RtseInvitedSchool {

    // =====================================================
    // Get distinct schools appearing in RTSE applications.
    // School name is the ONLY uniqueness/grouping key.
    // =====================================================
    static async getAll(applicationYear) {

        const year = Number(applicationYear);

        if (!year) {
            return [];
        }

        const [rows] = await db.query(`
            SELECT
                app.school_name,
                app.student_count,
                reg.school_code,
                reg.school_status,
                reg.registered,
                centres.centre_names

            FROM (
                SELECT
                    MIN(TRIM(a.school_name)) AS school_name,
                    LOWER(TRIM(a.school_name)) AS school_key,
                    COUNT(*) AS student_count
                FROM rtse_applications a
                WHERE a.archive = 0
                  AND a.application_year = ?
                  AND a.school_name IS NOT NULL
                  AND TRIM(a.school_name) <> ''
                GROUP BY LOWER(TRIM(a.school_name))
            ) app

            LEFT JOIN (
                SELECT
                    school_key,
                    MIN(school_code) AS school_code,
                    MIN(status) AS school_status,
                    1 AS registered
                FROM (
                    SELECT
                        LOWER(TRIM(s.school_name)) AS school_key,
                        s.school_code,
                        s.status
                    FROM arsp_schools s
                    WHERE s.school_name IS NOT NULL
                      AND TRIM(s.school_name) <> ''
                ) registered_schools
                GROUP BY school_key
            ) reg
                ON reg.school_key = app.school_key

            LEFT JOIN (
                SELECT
                    school_key,
                    GROUP_CONCAT(
                        DISTINCT centre_name
                        ORDER BY centre_name ASC
                        SEPARATOR ', '
                    ) AS centre_names
                FROM (
                    SELECT
                        LOWER(TRIM(s.school_name)) AS school_key,
                        c.centre_name
                    FROM arsp_schools s
                    INNER JOIN rtse_school_centre_assignments sca
                        ON sca.school_id = s.id
                    INNER JOIN rtse_centres c
                        ON c.id = sca.centre_id
                    WHERE sca.application_year = ?
                      AND sca.status IN ('Approved', 'Active')
                      AND c.centre_name IS NOT NULL
                      AND TRIM(c.centre_name) <> ''
                ) assigned_centres
                GROUP BY school_key
            ) centres
                ON centres.school_key = app.school_key

            ORDER BY app.school_name ASC
        `, [year, year]);

        return rows.map(row => ({
            school_name: row.school_name,

            school_code:
                Number(row.registered) === 1
                    ? (row.school_code || "—")
                    : "—",

            centre_name:
                Number(row.registered) === 1
                    ? (row.centre_names || "—")
                    : "—",

            registered:
                Number(row.registered) === 1,

            status:
                Number(row.registered) === 1
                    ? (row.school_status || "Unknown")
                    : "Not Registered",

            student_count:
                Number(row.student_count || 0)
        }));
    }

    // =====================================================
    // Dashboard count: distinct school names only.
    // =====================================================
    static async getCount(applicationYear) {

        const year = Number(applicationYear);

        if (!year) {
            return 0;
        }

        const [rows] = await db.query(`
            SELECT COUNT(*) AS total
            FROM (
                SELECT
                    LOWER(TRIM(school_name)) AS school_key
                FROM rtse_applications
                WHERE archive = 0
                  AND application_year = ?
                  AND school_name IS NOT NULL
                  AND TRIM(school_name) <> ''
                GROUP BY LOWER(TRIM(school_name))
            ) schools
        `, [year]);

        return Number(rows[0]?.total || 0);
    }
}

module.exports = RtseInvitedSchool;
