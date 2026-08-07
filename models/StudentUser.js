const db = require("../config/database");

const StudentUser = {

    async create(user) {
        const [result] = await db.query(
            `
            INSERT INTO student_users
            (
                student_id,
                username,
                password
            )
            VALUES
            (
                ?,?,?
            )
            `,
            [
                user.student_id,
                user.username,
                user.password
            ]
        );

        return result;
    },

    async findByUsername(username) {
        const [rows] = await db.query(
            `
            SELECT *
            FROM student_users
            WHERE username=?
            LIMIT 1
            `,
            [username]
        );

        return rows[0] || null;
    },

    async findByStudentId(studentId) {
        const [rows] = await db.query(
            `
            SELECT *
            FROM student_users
            WHERE student_id=?
            LIMIT 1
            `,
            [studentId]
        );

        return rows[0] || null;
    },

    async updateLastLogin(studentId) {
        const [result] = await db.query(
            `
            UPDATE student_users
            SET last_login=NOW()
            WHERE student_id=?
            `,
            [studentId]
        );

        return result;
    },

    async deleteByStudentId(studentId) {
        const [result] = await db.query(
            `
            DELETE FROM student_users
            WHERE student_id=?
            `,
            [studentId]
        );

        return result;
    }

};

module.exports = StudentUser;



