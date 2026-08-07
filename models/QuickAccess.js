const db = require("../config/database");

const QuickAccess = {

    // ===============================
    // Get All
    // ===============================

    async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM website_quick_buttons
            ORDER BY display_order ASC, id ASC
        `);

        return rows;

    },

    // ===============================
    // Get Active
    // ===============================

    async getActive() {

        const [rows] = await db.query(`
            SELECT *
            FROM website_quick_buttons
            WHERE status='Active'
            ORDER BY display_order ASC, id ASC
        `);

        return rows;

    },

    // ===============================
    // Get By ID
    // ===============================

    async getById(id) {

        const [rows] = await db.query(
            "SELECT * FROM website_quick_buttons WHERE id=?",
            [id]
        );

        return rows[0];

    },

    // ===============================
    // Create
    // ===============================

    async create(data) {

        const [result] = await db.query(

            `INSERT INTO website_quick_buttons
            (
                title,
                subtitle,
                icon,
                url,
                button_color,
                display_order,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,

            [
                data.title,
                data.subtitle,
                data.icon,
                data.url,
                data.button_color || "primary",
                data.display_order,
                data.status
            ]

        );

        return result;

    },

    // ===============================
    // Update
    // ===============================

    async update(id, data) {

        const [result] = await db.query(

            `UPDATE website_quick_buttons

            SET

            title=?,

            subtitle=?,

            icon=?,

            url=?,

            button_color=?,

            display_order=?,

            status=?

            WHERE id=?`,

            [

                data.title,

                data.subtitle,

                data.icon,

                data.url,

                data.button_color || "primary",

                data.display_order,

                data.status,

                id

            ]

        );

        return result;

    },

    // ===============================
    // Delete
    // ===============================

    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM website_quick_buttons WHERE id=?",
            [id]
        );

        return result;

    }

};

module.exports = QuickAccess;
