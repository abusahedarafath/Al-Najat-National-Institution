const db = require("../config/database");
const Exam = {

    // Get all exams
    getAll(callback) {

        const sql = `
            SELECT
                e.*,
                c.class_name,
                s.session_name
            FROM exams e
            LEFT JOIN classes c
                ON e.class_id = c.id
            LEFT JOIN academic_sessions s
                ON e.session_id = s.id
            ORDER BY e.exam_date DESC
        `;

        db.query(sql, callback);

    },

    // Get exam by ID
    getById(id, callback) {

        db.query(
            "SELECT * FROM exams WHERE id = ?",
            [id],
            callback
        );

    },

    // Create exam
    create(data, callback) {

        const sql = `
            INSERT INTO exams
            (
                exam_name,
                class_id,
                session_id,
                exam_date,
                total_marks,
                passing_marks,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                data.exam_name,
                data.class_id,
                data.session_id,
                data.exam_date,
                data.total_marks,
                data.passing_marks,
                data.status
            ],
            callback
        );

    },

    // Update exam
    update(id, data, callback) {

        const sql = `
            UPDATE exams
            SET
                exam_name = ?,
                class_id = ?,
                session_id = ?,
                exam_date = ?,
                total_marks = ?,
                passing_marks = ?,
                status = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                data.exam_name,
                data.class_id,
                data.session_id,
                data.exam_date,
                data.total_marks,
                data.passing_marks,
                data.status,
                id
            ],
            callback
        );

    },

    // Delete exam
    delete(id, callback) {

        db.query(
            "DELETE FROM exams WHERE id = ?",
            [id],
            callback
        );

    }

};

module.exports = Exam;
