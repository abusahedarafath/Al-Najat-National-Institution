const db = require("../config/database");

const Mark = {

    // Get all marks
    getAll(callback) {

        const sql = `
            SELECT
                m.*,
                s.name AS student_name,
                s.roll_number,
                sub.subject_name,
                e.exam_name,
                c.class_name
            FROM marks m
            LEFT JOIN students s
                ON m.student_id = s.id
            LEFT JOIN subjects sub
                ON m.subject_id = sub.id
            LEFT JOIN exams e
                ON m.exam_id = e.id
            LEFT JOIN classes c
                ON m.class_id = c.id
            ORDER BY m.id DESC
        `;

        db.query(sql, callback);

    },

    // Get mark by ID
    getById(id, callback) {

        db.query(
            "SELECT * FROM marks WHERE id = ?",
            [id],
            callback
        );

    },

    // Create mark
    create(data, callback) {

        const sql = `
            INSERT INTO marks
            (
                student_id,
                class_id,
                exam_id,
                subject_id,
                obtained_marks,
                total_marks,
                grade,
                gpa,
                remarks
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                data.student_id,
                data.class_id,
                data.exam_id,
                data.subject_id,
                data.obtained_marks,
                data.total_marks,
                data.grade,
                data.gpa,
                data.remarks
            ],
            callback
        );

    },

    // Update mark
    update(id, data, callback) {

        const sql = `
            UPDATE marks
            SET
                student_id = ?,
                class_id = ?,
                exam_id = ?,
                subject_id = ?,
                obtained_marks = ?,
                total_marks = ?,
                grade = ?,
                gpa = ?,
                remarks = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                data.student_id,
                data.class_id,
                data.exam_id,
                data.subject_id,
                data.obtained_marks,
                data.total_marks,
                data.grade,
                data.gpa,
                data.remarks,
                id
            ],
            callback
        );

    },

    // Delete mark
    delete(id, callback) {

        db.query(
            "DELETE FROM marks WHERE id = ?",
            [id],
            callback
        );

    },

    // Get marks by student
    getByStudent(studentId, callback) {

        const sql = `
            SELECT
                m.*,
                sub.subject_name,
                e.exam_name
            FROM marks m
            LEFT JOIN subjects sub
                ON m.subject_id = sub.id
            LEFT JOIN exams e
                ON m.exam_id = e.id
            WHERE m.student_id = ?
            ORDER BY e.exam_date DESC
        `;

        db.query(
            sql,
            [studentId],
            callback
        );

    }

};

module.exports = Mark;
