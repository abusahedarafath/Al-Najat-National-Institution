const db = require("../config/database");
const bcrypt = require("bcryptjs");

const User = {

    async create(user) {
        const hash = await bcrypt.hash(user.password, 10);

        const sql = `
            INSERT INTO users
            (
                username,
                password,
                role,
                reference_id,
                status
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            user.username,
            hash,
            user.role,
            user.reference_id,
            "Active"
        ]);

        return result;
    },

    async findByUsername(username) {
        const sql = `
            SELECT *
            FROM users
            WHERE username = ?
            LIMIT 1
        `;

        const [rows] = await db.query(sql, [username]);
        return rows[0] || null;
    }

};

module.exports = User;
