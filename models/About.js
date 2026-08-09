const db = require("../config/database");

class About {

    static async getAll() {
        const [rows] = await db.query(`
            SELECT *
            FROM about_sections
            ORDER BY display_order ASC, id ASC
        `);

        return rows;
    }

    static async getActive() {
        const [rows] = await db.query(`
            SELECT *
            FROM about_sections
            WHERE is_active = 1
            ORDER BY display_order ASC, id ASC
        `);

        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
            SELECT *
            FROM about_sections
            WHERE id = ?
            LIMIT 1
        `, [id]);

        return rows[0] || null;
    }

    static async getByKey(sectionKey) {
        const [rows] = await db.query(`
            SELECT *
            FROM about_sections
            WHERE section_key = ?
            LIMIT 1
        `, [sectionKey]);

        return rows[0] || null;
    }

    static async create(data) {
        const [result] = await db.query(`
            INSERT INTO about_sections
            (
                section_key,
                title,
                content,
                image,
                display_order,
                is_active
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            data.section_key,
            data.title,
            data.content || null,
            data.image || null,
            Number(data.display_order) || 0,
            data.is_active ? 1 : 0
        ]);

        return result;
    }

    static async update(id, data) {
        const [result] = await db.query(`
            UPDATE about_sections
            SET
                section_key = ?,
                title = ?,
                content = ?,
                image = ?,
                display_order = ?,
                is_active = ?
            WHERE id = ?
        `, [
            data.section_key,
            data.title,
            data.content || null,
            data.image || null,
            Number(data.display_order) || 0,
            data.is_active ? 1 : 0,
            id
        ]);

        return result;
    }

    static async delete(id) {
        const [result] = await db.query(
            `DELETE FROM about_sections WHERE id = ?`,
            [id]
        );

        return result;
    }

    static async toggle(id) {
        const [result] = await db.query(`
            UPDATE about_sections
            SET is_active = NOT is_active
            WHERE id = ?
        `, [id]);

        return result;
    }
}

module.exports = About;
