const db = require("../config/database");

const HeaderButton = {

    async getAll() {
        const [rows] = await db.query(`
            SELECT *
            FROM header_buttons
            ORDER BY display_order ASC, id ASC
        `);

        return rows;
    },

    async getActive() {
        const [rows] = await db.query(`
            SELECT *
            FROM header_buttons
            WHERE status = 'Active'
            ORDER BY display_order ASC, id ASC
        `);

        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(
            `
            SELECT *
            FROM header_buttons
            WHERE id = ?
            `,
            [id]
        );

        return rows[0];
    },

    async create(data) {
        const [result] = await db.query(
            `
            INSERT INTO header_buttons
            (
                title,
                icon,
                url,
                button_color,
                display_order,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                data.title,
                data.icon || null,
                data.url,
                data.button_color || "primary",
                data.display_order || 1,
                data.status || "Active"
            ]
        );

        return result;
    },

    async update(id, data) {
        const [result] = await db.query(
            `
            UPDATE header_buttons
            SET
                title = ?,
                icon = ?,
                url = ?,
                button_color = ?,
                display_order = ?,
                status = ?
            WHERE id = ?
            `,
            [
                data.title,
                data.icon || null,
                data.url,
                data.button_color || "primary",
                data.display_order || 1,
                data.status || "Active",
                id
            ]
        );

        return result;
    },

    async delete(id) {
        const [result] = await db.query(
            `
            DELETE FROM header_buttons
            WHERE id = ?
            `,
            [id]
        );

        return result;
    }

};

module.exports = HeaderButton;
