const db = require("../config/database");

const Certificate = {

    // ======================================
    // Get All Certificates
    // ======================================

    async getAll() {

        const [rows] = await db.query(`
SELECT
    c.*,
    s.full_name,
    s.student_id,
    s.course
FROM certificates c
LEFT JOIN students s
ON c.student_id = s.id
ORDER BY c.issue_date DESC
        `);

        return rows;

    },

    // ======================================
    // Get Certificate By ID
    // ======================================

    async getById(id) {

        const [rows] = await db.query(
            `
            SELECT
                c.*,
                s.*
            FROM certificates c
            LEFT JOIN students s
                ON c.student_id = s.id
            WHERE c.id = ?
            `,
            [id]
        );

        return rows[0];

    },

    // ======================================
    // Create Certificate
    // ======================================

    async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO certificates
            (
                certificate_no,
                student_id,
                certificate_type,
                issue_date,
                remarks
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                data.certificate_no,
                data.student_id,
                data.certificate_type,
                data.issue_date,
                data.remarks
            ]
        );

        return result;

    },

    // ======================================
    // Update Certificate
    // ======================================

    async update(id, data) {

        const [result] = await db.query(
            `
            UPDATE certificates
            SET
                certificate_type=?,
                issue_date=?,
                remarks=?
            WHERE id=?
            `,
            [
                data.certificate_type,
                data.issue_date,
                data.remarks,
                id
            ]
        );

        return result;

    },

    // ======================================
    // Delete Certificate
    // ======================================

    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM certificates WHERE id=?",
            [id]
        );

        return result;

    },

    // ======================================
    // Generate Certificate Number
    // ======================================

    async generateCertificateNo() {

        const [rows] = await db.query(`
            SELECT id
            FROM certificates
            ORDER BY id DESC
            LIMIT 1
        `);

        let nextId = 1;

        if (rows.length > 0) {

            nextId = rows[0].id + 1;

        }

        return "CERT-" + String(nextId).padStart(6, "0");

    }

};

module.exports = Certificate;
