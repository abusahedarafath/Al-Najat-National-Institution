const db = require("../config/database");

class Subject {

    // ==========================
    // Get All Subjects
    // ==========================
    static async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM subjects
            ORDER BY sort_order ASC, id ASC
        `);

        return rows;
    }

    // ==========================
    // Get Subject By ID
    // ==========================
    static async getById(id) {

        const [rows] = await db.query(
            "SELECT * FROM subjects WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    // ==========================
    // Create Subject
    // ==========================
    static async create(data) {

        const [result] = await db.query(`
            INSERT INTO subjects (
                subject_name,
                subject_code,
                class_name,
                teacher_name,
                subject_type,
                sort_order,
                status
            )
            VALUES (?,?,?,?,?,?,?)
        `, [
            data.subject_name,
            data.subject_code,
            data.class_name,
            data.teacher_name,
            data.subject_type,
            data.sort_order,
            data.status
        ]);

        return result;
    }

    // ==========================
    // Update Subject
    // ==========================
    static async update(id, data) {

        const [result] = await db.query(`
            UPDATE subjects
            SET
                subject_name=?,
                subject_code=?,
                class_name=?,
                teacher_name=?,
                subject_type=?,
                sort_order=?,
                status=?
            WHERE id=?
        `, [
            data.subject_name,
            data.subject_code,
            data.class_name,
            data.teacher_name,
            data.subject_type,
            data.sort_order,
            data.status,
            id
        ]);

        return result;
    }

    // ==========================
    // Delete Subject
    // ==========================
    static async delete(id) {

        const [result] = await db.query(
            "DELETE FROM subjects WHERE id = ?",
            [id]
        );

        return result;
    }

}

module.exports = Subject;
