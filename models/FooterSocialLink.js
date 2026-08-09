const db = require("../config/database");

class FooterSocialLink {

    // =====================================
    // Get All Social Links
    // =====================================

    static async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM footer_social_links
            ORDER BY sort_order ASC, id ASC
        `);

        return rows;
    }

    // =====================================
    // Create Social Link
    // =====================================

    static async create(data) {

        return db.query(`
            INSERT INTO footer_social_links
            (
                platform,
                icon_class,
                url,
                sort_order,
                is_active
            )
            VALUES (?, ?, ?, ?, ?)
        `, [
            data.platform,
            data.icon_class || "",
            data.url,
            data.sort_order || 0,
            data.is_active ? 1 : 0
        ]);
    }

    // =====================================
    // Update Social Link
    // =====================================

    static async update(id, data) {

        return db.query(`
            UPDATE footer_social_links
            SET
                platform = ?,
                icon_class = ?,
                url = ?,
                sort_order = ?,
                is_active = ?
            WHERE id = ?
        `, [
            data.platform,
            data.icon_class || "",
            data.url,
            data.sort_order || 0,
            data.is_active ? 1 : 0,
            id
        ]);
    }

    // =====================================
    // Delete Social Link
    // =====================================

    static async delete(id) {

        return db.query(
            "DELETE FROM footer_social_links WHERE id = ?",
            [id]
        );
    }
}

module.exports = FooterSocialLink;
