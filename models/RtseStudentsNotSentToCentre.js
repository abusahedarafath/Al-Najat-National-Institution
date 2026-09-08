const db = require("../config/database");

class RtseStudentsNotSentToCentre {
    static async getAll(applicationYear, search = "", status = "") {
        const year = Number(applicationYear);
        if (!year) return [];

        const params = [year];

        let whereSql = `
            a.archive = 0
            AND a.application_year = ?
            AND NOT EXISTS (
                SELECT 1
                FROM rtse_school_centre_assignments sca
                INNER JOIN rtse_centres c
                    ON c.id = sca.centre_id
                INNER JOIN arsp_schools s
                    ON s.id = sca.school_id
                WHERE sca.school_id = a.school_id
                  AND sca.application_year = a.application_year
                  AND LOWER(sca.status) = 'approved'
                  AND LOWER(c.status) = 'approved'
                  AND LOWER(s.status) = 'approved'
            )
        `;

        if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
            whereSql += ` AND a.status = ?`;
            params.push(status);
        }

        if (search) {
            const searchValue = `%${String(search).trim()}%`;

            whereSql += `
                AND (
                    a.registration_no LIKE ?
                    OR a.full_name LIKE ?
                    OR a.father_name LIKE ?
                    OR a.mobile LIKE ?
                    OR a.school_name LIKE ?
                    OR a.district LIKE ?
                    OR a.status LIKE ?
                    OR a.roll_no LIKE ?
                )
            `;

            params.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }

        const [rows] = await db.query(
            `
            SELECT
                a.id,
                a.registration_no,
                a.full_name,
                a.father_name,
                a.mobile,
                a.school_name,
                a.district,
                a.status,
                a.roll_no,
                a.class,
                a.section,
                a.photo,
                a.admit_generated
            FROM rtse_applications a
            WHERE ${whereSql}
            ORDER BY
                CASE
                    WHEN a.status = 'Pending' THEN 1
                    WHEN a.status = 'Approved' THEN 2
                    WHEN a.status = 'Rejected' THEN 3
                    ELSE 4
                END,
                a.registration_no ASC
            `,
            params
        );

        return rows;
    }

    static async getCount(applicationYear) {
        const year = Number(applicationYear);
        if (!year) return 0;

        const [rows] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM rtse_applications a
            WHERE a.archive = 0
              AND a.application_year = ?
              AND NOT EXISTS (
                  SELECT 1
                  FROM rtse_school_centre_assignments sca
                  INNER JOIN rtse_centres c
                      ON c.id = sca.centre_id
                  INNER JOIN arsp_schools s
                      ON s.id = sca.school_id
                  WHERE sca.school_id = a.school_id
                    AND sca.application_year = a.application_year
                    AND LOWER(sca.status) = 'approved'
                    AND LOWER(c.status) = 'approved'
                    AND LOWER(s.status) = 'approved'
              )
            `,
            [year]
        );

        return Number(rows[0]?.total || 0);
    }
}

module.exports = RtseStudentsNotSentToCentre;
