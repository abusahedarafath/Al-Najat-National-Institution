const db = require("../config/database");

class RtseStudentsWithoutSchool {

    // =====================================================
    // Get students whose submitted RTSE application has
    // no school name for the active examination year.
    // =====================================================
    static async getAll(applicationYear, search = "", status = "", examSettingId) {

        const year = Number(applicationYear);
        const examId = Number(examSettingId);
        const hasExamId = Number.isInteger(examId) && examId > 0;

        if (!year || !hasExamId) throw new Error("A valid application year and examination ID are required.");

        const params = [year];
        if (hasExamId) params.push(examId);

        let whereSql = `
            a.archive = 0
            AND a.application_year = ?
            AND a.exam_setting_id = ?
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
    static async getCount(applicationYear, examSettingId) {

        const year = Number(applicationYear);
        const examId = Number(examSettingId);
        const hasExamId = Number.isInteger(examId) && examId > 0;

        if (!year || !hasExamId) throw new Error("A valid application year and examination ID are required.");

        const [rows] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM rtse_applications a
            WHERE a.archive = 0
              AND a.application_year = ?
              AND a.exam_setting_id = ?
              AND (
                  a.school_name IS NULL
                  OR TRIM(a.school_name) = ''
              )
            `,
            [year, examId]
        );

        return Number(rows[0]?.total || 0);
    }
}

module.exports = RtseStudentsWithoutSchool;
