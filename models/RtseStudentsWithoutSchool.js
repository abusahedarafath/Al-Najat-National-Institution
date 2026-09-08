const db = require("../config/database");

class RtseStudentsWithoutSchool {

    // =====================================================
    // Get students whose submitted RTSE application has
    // no school name for the active examination year.
    // =====================================================
    static async getAll(applicationYear, search = "", status = "") {

        const year = Number(applicationYear);

        if (!year) {
            return [];
        }

        const params = [year];

        let whereSql = `
            a.archive = 0
            AND a.application_year = ?
            AND (
                a.school_name IS NULL
                OR TRIM(a.school_name) = ''
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


    // =====================================================
    // Dashboard count
    // =====================================================
    static async getCount(applicationYear) {

        const year = Number(applicationYear);

        if (!year) {
            return 0;
        }

        const [rows] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM rtse_applications a
            WHERE a.archive = 0
              AND a.application_year = ?
              AND (
                  a.school_name IS NULL
                  OR TRIM(a.school_name) = ''
              )
            `,
            [year]
        );

        return Number(rows[0]?.total || 0);
    }
}

module.exports = RtseStudentsWithoutSchool;
