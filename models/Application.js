const db = require("../config/database");

class Application {

    // ==========================
    // Create New Application
    // ==========================
    static async create(data) {

        const sql = `
            INSERT INTO applications (
                application_no,
                session,
                full_name,
                father_name,
                mother_name,
                dob,
                gender,
                mobile,
                email,
                address,
                course,
                previous_school,
                pen_no,
                apaar_id,
                siksha_setu_id,
                status
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const [result] = await db.query(sql, [
            data.application_no,
            data.session,
            data.full_name,
            data.father_name,
            data.mother_name,
            data.dob,
            data.gender,
            data.mobile,
            data.email,
            data.address,
            data.course,
            data.previous_school,
            data.pen_no,
            data.apaar_id,
            data.siksha_setu_id,
            "Pending"
        ]);

        return result;
    }





static async getDashboardStats() {
    const sql = `
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) AS rejected
        FROM applications
    `;

    const [rows] = await db.query(sql);
    return rows[0];
}





static async getRecentApplications() {
    const sql = `
        SELECT
            id,
            application_no,
            full_name,
            status,
            created_at
        FROM applications
        ORDER BY id DESC
        LIMIT 5
    `;

    const [rows] = await db.query(sql);
    return rows;
}



    // ==========================
    // Get All Applications
    // ==========================
    static async getAll() {

        const sql = `
            SELECT
                id,
                application_no,
                full_name,
                mobile,
                course,
                status,
                created_at
            FROM applications
            ORDER BY id DESC
        `;

        const [rows] = await db.query(sql);
        return rows;
    }

    // ==========================
    // Get Last Application
    // ==========================
    static async getLastApplication() {

        const sql = `
            SELECT application_no
            FROM applications
            ORDER BY id DESC
            LIMIT 1
        `;

        const [rows] = await db.query(sql);
        return rows;
    }

    // ==========================
    // Get Application By ID
    // ==========================
    static async getById(id) {

        const sql = `
            SELECT *
            FROM applications
            WHERE id = ?
        `;

        const [rows] = await db.query(sql, [id]);
        return rows;
    }

    // ==========================
    // Update Application Status
    // ==========================
    static async updateStatus(id, status) {

        const sql = `
            UPDATE applications
            SET status = ?
            WHERE id = ?
        `;

        const [result] = await db.query(sql, [status, id]);
        return result;
    }

    // ==========================
    // Update Application
    // ==========================
    static async update(id, data) {

        const sql = `
            UPDATE applications
            SET
                full_name = ?,
                father_name = ?,
                mother_name = ?,
                dob = ?,
                gender = ?,
                mobile = ?,
                email = ?,
                address = ?,
                course = ?,
                previous_school = ?,
                pen_no = ?,
                apaar_id = ?,
                siksha_setu_id = ?
            WHERE id = ?
        `;

        const [result] = await db.query(sql, [
            data.full_name,
            data.father_name,
            data.mother_name,
            data.dob,
            data.gender,
            data.mobile,
            data.email,
            data.address,
            data.course,
            data.previous_school,
            data.pen_no,
            data.apaar_id,
            data.siksha_setu_id,
            id
        ]);

        return result;
    }


// ==========================
// Delete Application
// ==========================
static async delete(id) {
    const [result] = await db.query(
        "DELETE FROM applications WHERE id = ?",
        [id]
    );

    return result;
}
}

module.exports = Application
