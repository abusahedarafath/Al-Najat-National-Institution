const db = require("../config/database");

class FooterLink {

    static async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM footer_links
            ORDER BY section ASC, sort_order ASC, id ASC
        `);

        return rows;

    }


    static async create(data) {

        return db.query(`
            INSERT INTO footer_links
            (
                section,
                title,
                url,
                sort_order,
                is_active
            )
            VALUES (?, ?, ?, ?, ?)
        `, [

            data.section,
            data.title,
            data.url,
            data.sort_order || 0,
            data.is_active ? 1 : 0

        ]);

    }


    static async update(id, data) {

        return db.query(`
            UPDATE footer_links
            SET
                section = ?,
                title = ?,
                url = ?,
                sort_order = ?,
                is_active = ?
            WHERE id = ?
        `, [

            data.section,
            data.title,
            data.url,
            data.sort_order || 0,
            data.is_active ? 1 : 0,
            id

        ]);

    }


    static async delete(id) {

        return db.query(
            "DELETE FROM footer_links WHERE id = ?",
            [id]
        );

    }

}

module.exports = FooterLink;
