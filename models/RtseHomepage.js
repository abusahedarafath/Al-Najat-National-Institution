const db = require("../config/database");

class RtseHomepage {
    static async getAll(includeInactive = true) {
        const sql = includeInactive
            ? `SELECT * FROM rtse_homepage_sections ORDER BY display_order ASC, id ASC`
            : `SELECT * FROM rtse_homepage_sections WHERE is_active=1 ORDER BY display_order ASC, id ASC`;

        const [rows] = await db.query(sql);
        return rows;
    }

    static async getByKey(sectionKey) {
        const [rows] = await db.query(
            `SELECT * FROM rtse_homepage_sections WHERE section_key=? LIMIT 1`,
            [sectionKey]
        );
        return rows[0] || null;
    }

    static async update(id, data) {
        await db.query(
            `UPDATE rtse_homepage_sections
             SET title=?,
                 subtitle=?,
                 content=?,
                 settings=?,
                 display_order=?,
                 is_active=?
             WHERE id=?`,
            [
                data.title || null,
                data.subtitle || null,
                data.content || "",
                data.settings || "{}",
                Number.isInteger(Number(data.display_order))
                    ? Number(data.display_order)
                    : 0,
                Number(data.is_active) === 1 ? 1 : 0,
                id
            ]
        );

        return this.getById(id);
    }

    static async getById(id) {
        const [rows] = await db.query(
            `SELECT * FROM rtse_homepage_sections WHERE id=? LIMIT 1`,
            [id]
        );
        return rows[0] || null;
    }

    static async setActive(id, active) {
        await db.query(
            `UPDATE rtse_homepage_sections SET is_active=? WHERE id=?`,
            [active ? 1 : 0, id]
        );
        return this.getById(id);
    }
}

module.exports = RtseHomepage;
