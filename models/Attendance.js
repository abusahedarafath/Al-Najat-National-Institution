const db = require("../config/database");
const Attendance = {

    // Get all attendance records
    getAll(callback) {
        const sql = `
            SELECT
                a.*,
                s.name AS student_name,
                s.roll_number,
                c.class_name
            FROM attendance a
            LEFT JOIN students s ON a.student_id = s.id
            LEFT JOIN classes c ON a.class_id = c.id
            ORDER BY a.attendance_date DESC
        `;

        db.query(sql, callback);
    },

    // Get attendance by ID
    getById(id, callback) {
        db.query(
            "SELECT * FROM attendance WHERE id = ?",
            [id],
            callback
        );
    },

    // Get attendance by date & class
    getByDateAndClass(date, classId, callback) {
        db.query(
            "SELECT * FROM attendance WHERE attendance_date = ? AND class_id = ?",
            [date, classId],
            callback
        );
    },

    // Create attendance
    create(data, callback) {

        const sql = `
            INSERT INTO attendance
            (
                student_id,
                class_id,
                attendance_date,
                status,
                remarks
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                data.student_id,
                data.class_id,
                data.attendance_date,
                data.status,
                data.remarks
            ],
            callback
        );
    },

    // Update attendance
    update(id, data, callback) {

        const sql = `
            UPDATE attendance
            SET
                student_id=?,
                class_id=?,
                attendance_date=?,
                status=?,
                remarks=?
            WHERE id=?
        `;

        db.query(
            sql,
            [
                data.student_id,
                data.class_id,
                data.attendance_date,
                data.status,
                data.remarks,
                id
            ],
            callback
        );
    },

    // Delete attendance
    delete(id, callback) {
        db.query(
            "DELETE FROM attendance WHERE id=?",
            [id],
            callback
        );
    }

};

module.exports = Attendance;
