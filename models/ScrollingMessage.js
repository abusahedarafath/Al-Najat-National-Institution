const db = require("../config/database");

const ScrollingMessage = {

    async getAll() {
        const [rows] = await db.query(`
            SELECT *
            FROM scrolling_messages
            ORDER BY display_order ASC, id ASC
        `);

        return rows;
    },

    async getActive() {
        const [rows] = await db.query(`
            SELECT *
            FROM scrolling_messages
            WHERE status = 'Active'
              AND (start_date IS NULL OR start_date <= NOW())
              AND (end_date IS NULL OR end_date >= NOW())
            ORDER BY display_order ASC, id ASC
        `);

        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(
            `
            SELECT *
            FROM scrolling_messages
            WHERE id = ?
            `,
            [id]
        );

        return rows[0];
    },

    async create(data) {
        const [result] = await db.query(
            `
            INSERT INTO scrolling_messages
            (
                message,
                url,
                text_color,
                display_order,
                status,
                start_date,
                end_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.message,
                data.url || null,
                data.text_color || "#16246D",
                data.display_order || 1,
                data.status || "Active",
                data.start_date || null,
                data.end_date || null
            ]
        );

        return result;
    },

    async update(id, data) {
        const [result] = await db.query(
            `
            UPDATE scrolling_messages
            SET
                message = ?,
                url = ?,
                text_color = ?,
                display_order = ?,
                status = ?,
                start_date = ?,
                end_date = ?
            WHERE id = ?
            `,
            [
                data.message,
                data.url || null,
                data.text_color || "#16246D",
                data.display_order || 1,
                data.status || "Active",
                data.start_date || null,
                data.end_date || null,
                id
            ]
        );

        return result;
    },

    async delete(id) {
        const [result] = await db.query(
            `
            DELETE FROM scrolling_messages
            WHERE id = ?
            `,
            [id]
        );

        return result;
    }

};

module.exports = ScrollingMessage;
