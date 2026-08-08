const db = require("../config/database");

class HomepageFeature {

    // Get all features
    static async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM homepage_features
            ORDER BY display_order ASC, id ASC
        `);

        return rows;
    }

    // Get active features for homepage
    static async getActive() {

        const [rows] = await db.query(`
            SELECT *
            FROM homepage_features
            WHERE is_active = 1
            ORDER BY display_order ASC, id ASC
        `);

        return rows;
    }

    // Get one feature
    static async getById(id) {

        const [rows] = await db.query(
            `
            SELECT *
            FROM homepage_features
            WHERE id = ?
            `,
            [id]
        );

        return rows[0];
    }

    // Create feature
    static async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO homepage_features
            (
                title,
                description,
                icon,
                display_order,
                is_active
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                data.title,
                data.description,
                data.icon || null,
                data.display_order || 0,
                data.is_active !== undefined ? data.is_active : 1
            ]
        );

        return result.insertId;
    }

    // Update feature
    static async update(id, data) {

        await db.query(
            `
            UPDATE homepage_features
            SET
                title = ?,
                description = ?,
                icon = ?,
                display_order = ?,
                is_active = ?
            WHERE id = ?
            `,
            [
                data.title,
                data.description,
                data.icon || null,
                data.display_order || 0,
                data.is_active !== undefined ? data.is_active : 1,
                id
            ]
        );
    }

    // Delete feature
    static async delete(id) {

        await db.query(
            `
            DELETE FROM homepage_features
            WHERE id = ?
            `,
            [id]
        );
    }

}

module.exports = HomepageFeature;
