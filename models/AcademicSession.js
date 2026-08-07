const db = require("../config/database");

class AcademicSession {

    // ==========================
    // Get All Sessions
    // ==========================
    static async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM academic_sessions
            ORDER BY id DESC
        `);

        return rows;
    }

    // ==========================
    // Get Session By ID
    // ==========================
    static async getById(id) {

        const [rows] = await db.query(
            "SELECT * FROM academic_sessions WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    // ==========================
    // Create Session
    // ==========================
    static async create(data) {

        const [result] = await db.query(`
            INSERT INTO academic_sessions (
                session_name,
                start_date,
                end_date,
                description,
                status
            )
            VALUES (?,?,?,?,?)
        `, [
            data.session_name,
            data.start_date,
            data.end_date,
            data.description,
            data.status
        ]);

        return result;
    }

    // ==========================
    // Update Session
    // ==========================
    static async update(id, data) {

        const [result] = await db.query(`
            UPDATE academic_sessions
            SET
                session_name=?,
                start_date=?,
                end_date=?,
                description=?,
                status=?
            WHERE id=?
        `, [
            data.session_name,
            data.start_date,
            data.end_date,
            data.description,
            data.status,
            id
        ]);

        return result;
    }

    // ==========================
    // Delete Session
    // ==========================
    static async delete(id) {

        const [result] = await db.query(
            "DELETE FROM academic_sessions WHERE id = ?",
            [id]
        );

        return result;
    }

}

module.exports = AcademicSession;
