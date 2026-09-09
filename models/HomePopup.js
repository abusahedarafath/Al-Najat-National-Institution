const db = require("../config/database");

const HomePopup = {
    async getAll() {
        const [rows] = await db.query(`
            SELECT *
            FROM home_popups
            ORDER BY id DESC
        `);

        return rows.map(parseButtons);
    },

    async getById(id) {
        const [rows] = await db.query(`
            SELECT *
            FROM home_popups
            WHERE id = ?
        `, [id]);

        return rows[0] ? parseButtons(rows[0]) : null;
    },

    async getActive() {
        const [rows] = await db.query(`
            SELECT *
            FROM home_popups
            WHERE status = 'Active'
              AND (start_at IS NULL OR start_at <= NOW())
              AND (end_at IS NULL OR end_at >= NOW())
            ORDER BY id DESC
            LIMIT 1
        `);

        return rows[0] ? parseButtons(rows[0]) : null;
    },

    async create(data) {
        const [result] = await db.query(`
            INSERT INTO home_popups
            (
                title,
                message,
                buttons,
                status,
                start_at,
                end_at,
                display_frequency
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            data.title,
            data.message,
            JSON.stringify(data.buttons || []),
            data.status || "Inactive",
            data.start_at || null,
            data.end_at || null,
            data.display_frequency || "always"
        ]);

        return result;
    },

    async update(id, data) {
        const [result] = await db.query(`
            UPDATE home_popups
            SET
                title = ?,
                message = ?,
                buttons = ?,
                status = ?,
                start_at = ?,
                end_at = ?,
                display_frequency = ?
            WHERE id = ?
        `, [
            data.title,
            data.message,
            JSON.stringify(data.buttons || []),
            data.status || "Inactive",
            data.start_at || null,
            data.end_at || null,
            data.display_frequency || "always",
            id
        ]);

        return result;
    },

    async delete(id) {
        const [result] = await db.query(`
            DELETE FROM home_popups
            WHERE id = ?
        `, [id]);

        return result;
    },

    async toggle(id) {
        const [result] = await db.query(`
            UPDATE home_popups
            SET status = CASE
                WHEN status = 'Active' THEN 'Inactive'
                ELSE 'Active'
            END
            WHERE id = ?
        `, [id]);

        return result;
    }
};

function parseButtons(row) {
    let buttons = [];

    if (row.buttons) {
        try {
            buttons = typeof row.buttons === "string"
                ? JSON.parse(row.buttons)
                : row.buttons;
        } catch {
            buttons = [];
        }
    }

    return {
        ...row,
        buttons: Array.isArray(buttons) ? buttons : []
    };
}

module.exports = HomePopup;
