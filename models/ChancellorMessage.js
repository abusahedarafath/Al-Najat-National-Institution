const db = require("../config/database");

const ChancellorMessage = {

    async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM chancellor_messages
            ORDER BY id DESC
        `);

        return rows;

    },

    async get() {

        const [rows] = await db.query(`
            SELECT *
            FROM chancellor_messages
            WHERE status='Active'
            LIMIT 1
        `);

        return rows;

    },

    async getById(id) {

        const [rows] = await db.query(
            `
            SELECT *
            FROM chancellor_messages
            WHERE id=?
            `,
            [id]
        );

        return rows[0] || null;

    },

    async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO chancellor_messages
            (
                name,
                designation,
                message,
                image,
                status
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                data.name,
                data.designation,
                data.message,
                data.image || null,
                data.status
            ]
        );

        return result;

    },

    async update(id, data) {

        const [result] = await db.query(
            `
            UPDATE chancellor_messages
            SET
                name=?,
                designation=?,
                message=?,
                image=?,
                status=?
            WHERE id=?
            `,
            [
                data.name,
                data.designation,
                data.message,
                data.image || null,
                data.status,
                id
            ]
        );

        return result;

    },

    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM chancellor_messages WHERE id=?",
            [id]
        );

        return result;

    }

};

module.exports = ChancellorMessage;
