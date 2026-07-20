const db = require("../config/database");

class StudentUser {

    // Create Student Login Account
    static create(data, callback) {

        const sql = `
            INSERT INTO student_users
            (student_id, username, password)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [
                data.student_id,
                data.username,
                data.password
            ],
            callback
        );

    }

    // Find by Username
    static findByUsername(username, callback) {

        const sql = `
            SELECT *
            FROM student_users
            WHERE username = ?
            LIMIT 1
        `;

        db.query(sql, [username], callback);

    }

    // Find by Student ID
    static findByStudentId(studentId, callback) {

        const sql = `
            SELECT *
            FROM student_users
            WHERE student_id = ?
            LIMIT 1
        `;

        db.query(sql, [studentId], callback);

    }

    // Update Last Login
    static updateLastLogin(studentId, callback) {

        const sql = `
            UPDATE student_users
            SET last_login = NOW()
            WHERE student_id = ?
        `;

        db.query(sql, [studentId], callback);

    }

}

module.exports = StudentUser;
