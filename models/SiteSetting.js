const db = require("../config/database");

class SiteSetting {

    static async get() {

        const [rows] = await db.query(
            "SELECT * FROM site_settings LIMIT 1"
        );

        return rows[0] || null;

    }

    static async update(data) {

        const sql = `
            UPDATE site_settings
            SET
                institution_name = ?,
                tagline = ?,
                logo = ?,
                favicon = ?
            WHERE id = 1
        `;

        const [result] = await db.query(sql, [
            data.institution_name,
            data.tagline,
            data.logo,
            data.favicon
        ]);

        return result;

    }

}

module.exports = SiteSetting;
