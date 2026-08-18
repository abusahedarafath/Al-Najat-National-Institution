const db = require("../config/database");

class ArspSchool {

    // =====================================
    // Generate School Code
    // =====================================
    static async generateSchoolCode() {
        const [rows] = await db.query(`
            SELECT id
            FROM arsp_schools
            ORDER BY id DESC
            LIMIT 1
        `);

        const nextNumber = rows.length
            ? rows[0].id + 1
            : 1;

        return "ARSP-SCH-" + String(nextNumber).padStart(5, "0");
    }


    // =====================================
    // Create School
    // =====================================
    static async create(data) {

        const schoolCode =
            data.school_code || await this.generateSchoolCode();

        const sql = `
            INSERT INTO arsp_schools (
                school_code,
                school_name,
                school_type,
                head_name,
                mobile,
                email,
                address,
                village,
                post_office,
                district,
                state,
                pincode,
                status,
                remarks,
                created_by
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const [result] = await db.query(sql, [
            schoolCode,
            data.school_name,
            data.school_type || "School",
            data.head_name || null,
            data.mobile || null,
            data.email || null,
            data.address || null,
            data.village || null,
            data.post_office || null,
            data.district || null,
            data.state || "Assam",
            data.pincode || null,
            data.status || "Pending",
            data.remarks || null,
            data.created_by || null
        ]);

        return {
            id: result.insertId,
            school_code: schoolCode
        };
    }


    // =====================================
    // Get School By ID
    // =====================================
    static async getById(id) {

        const [rows] = await db.query(`
            SELECT *
            FROM arsp_schools
            WHERE id = ?
            LIMIT 1
        `, [id]);

        return rows[0] || null;
    }


    // =====================================
    // Get School By Code
    // =====================================
    static async getByCode(schoolCode) {

        const [rows] = await db.query(`
            SELECT *
            FROM arsp_schools
            WHERE school_code = ?
            LIMIT 1
        `, [schoolCode]);

        return rows[0] || null;
    }


    // =====================================
    // Get All Schools
    // =====================================
    static async getAll(search = "", status = "") {

        let sql = `
            SELECT *
            FROM arsp_schools
            WHERE 1=1
        `;

        const params = [];

        if (search && search.trim() !== "") {

            const keyword =
                `%${search.trim().toLowerCase()}%`;

            sql += `
                AND (
                    LOWER(COALESCE(school_code, '')) LIKE ?
                    OR LOWER(COALESCE(school_name, '')) LIKE ?
                    OR LOWER(COALESCE(head_name, '')) LIKE ?
                    OR LOWER(COALESCE(mobile, '')) LIKE ?
                    OR LOWER(COALESCE(district, '')) LIKE ?
                )
            `;

            params.push(
                keyword,
                keyword,
                keyword,
                keyword,
                keyword
            );
        }

        if (
            status &&
            ["Pending", "Approved", "Rejected", "Inactive"]
                .includes(status)
        ) {
            sql += ` AND status = ?`;
            params.push(status);
        }

        sql += `
            ORDER BY id DESC
        `;

        const [rows] = await db.query(sql, params);

        return rows;
    }


    // =====================================
    // Get Approved Schools
    // =====================================
    static async getApproved(search = "") {
        return this.getAll(search, "Approved");
    }


    // =====================================
    // Get Pending Schools
    // =====================================
    static async getPending(search = "") {
        return this.getAll(search, "Pending");
    }


    // =====================================
    // Update School
    // =====================================
    static async update(id, data) {

        const sql = `
            UPDATE arsp_schools
            SET
                school_name = ?,
                school_type = ?,
                head_name = ?,
                mobile = ?,
                email = ?,
                address = ?,
                village = ?,
                post_office = ?,
                district = ?,
                state = ?,
                pincode = ?,
                remarks = ?
            WHERE id = ?
        `;

        const [result] = await db.query(sql, [
            data.school_name,
            data.school_type || "School",
            data.head_name || null,
            data.mobile || null,
            data.email || null,
            data.address || null,
            data.village || null,
            data.post_office || null,
            data.district || null,
            data.state || "Assam",
            data.pincode || null,
            data.remarks || null,
            id
        ]);

        return result;
    }


    // =====================================
    // Approve School
    // =====================================
    static async approve(id, approvedBy = null) {

        const [result] = await db.query(`
            UPDATE arsp_schools
            SET
                status = 'Approved',
                approved_by = ?,
                approved_at = NOW()
            WHERE id = ?
        `, [
            approvedBy,
            id
        ]);

        return result;
    }


    // =====================================
    // Reject School
    // =====================================
    static async reject(id, remarks = null, rejectedBy = null) {

        const [result] = await db.query(`
            UPDATE arsp_schools
            SET
                status = 'Rejected',
                remarks = ?,
                approved_by = ?,
                approved_at = NOW()
            WHERE id = ?
        `, [
            remarks,
            rejectedBy,
            id
        ]);

        return result;
    }


    // =====================================
    // Set Inactive
    // =====================================
    static async deactivate(id) {

        const [result] = await db.query(`
            UPDATE arsp_schools
            SET status = 'Inactive'
            WHERE id = ?
        `, [id]);

        return result;
    }


    // =====================================
    // Reactivate
    // =====================================
    static async activate(id) {

        const [result] = await db.query(`
            UPDATE arsp_schools
            SET status = 'Approved'
            WHERE id = ?
        `, [id]);

        return result;
    }


    // =====================================
    // Dashboard Counts
    // =====================================
    static async getDashboardCounts() {

        const [rows] = await db.query(`
            SELECT
                COUNT(*) AS total,
                SUM(status = 'Pending') AS pending,
                SUM(status = 'Approved') AS approved,
                SUM(status = 'Rejected') AS rejected,
                SUM(status = 'Inactive') AS inactive
            FROM arsp_schools
        `);

        return rows[0] || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            inactive: 0
        };
    }
}

module.exports = ArspSchool;
