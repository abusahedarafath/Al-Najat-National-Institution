const db = require("../config/database");

class HomepageAchievement {

    static async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM homepage_achievements
            ORDER BY display_order ASC, id ASC
        `);

        return rows;
    }

    static async getActive() {

        const [rows] = await db.query(`
            SELECT *
            FROM homepage_achievements
            WHERE is_active = 1
            ORDER BY display_order ASC, id ASC
        `);

        return rows;
    }

    static async getById(id) {

        const [rows] = await db.query(
            `
            SELECT *
            FROM homepage_achievements
            WHERE id = ?
            `,
            [id]
        );

        return rows[0];
    }

    static async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO homepage_achievements
            (
                title,
                value,
                description,
                display_order,
                is_active
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                data.title,
                data.value,
                data.description || null,
                data.display_order || 0,
                data.is_active !== undefined ? data.is_active : 1
            ]
        );

        return result.insertId;
    }

    static async update(id, data) {

        await db.query(
            `
            UPDATE homepage_achievements
            SET
                title = ?,
                value = ?,
                description = ?,
                display_order = ?,
                is_active = ?
            WHERE id = ?
            `,
            [
                data.title,
                data.value,
                data.description || null,
                data.display_order || 0,
                data.is_active !== undefined ? data.is_active : 1,
                id
            ]
        );
    }

    static async delete(id) {

        await db.query(
            `
            DELETE FROM homepage_achievements
            WHERE id = ?
            `,
            [id]
        );
    }

}

module.exports = HomepageAchievement;
