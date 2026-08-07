const db = require("../config/database");

const WelcomeSection = {

    // Get Active Welcome Section
    async getActive() {

        const [rows] = await db.query(`
            SELECT *
            FROM welcome_sections
            WHERE status='Active'
            LIMIT 1
        `);

        return rows[0] || null;

    },

    // Get All
    async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM welcome_sections
            ORDER BY id DESC
        `);

        return rows;

    },

    // Get By ID
    async getById(id) {

        const [rows] = await db.query(
            "SELECT * FROM welcome_sections WHERE id=?",
            [id]
        );

        return rows[0] || null;

    },

    // Create
    async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO welcome_sections
            (
                small_title,
                title,
                description,
                image,
                button_text,
                button_link,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.small_title,
                data.title,
                data.description,
                data.image || null,
                data.button_text,
                data.button_link,
                data.status
            ]
        );

        return result;

    },

    // Update
    async update(id, data) {

        const [result] = await db.query(
            `
            UPDATE welcome_sections
            SET
                small_title=?,
                title=?,
                description=?,
                image=COALESCE(?, image),
                button_text=?,
                button_link=?,
                status=?
            WHERE id=?
            `,
            [
                data.small_title,
                data.title,
                data.description,
                data.image || null,
                data.button_text,
                data.button_link,
                data.status,
                id
            ]
        );

        return result;

    },

    // Delete
    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM welcome_sections WHERE id=?",
            [id]
        );

        return result;

    }

};

module.exports = WelcomeSection;
