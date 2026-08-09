const db = require("../config/database");

class FooterSetting {

    // =====================================
    // Get Footer Settings
    // =====================================

    static async get() {
        const [rows] = await db.query(`
            SELECT *
            FROM footer_settings
            WHERE id = 1
            LIMIT 1
        `);

        return rows[0] || null;
    }

    // =====================================
    // Update Footer Settings
    // =====================================

    static async update(data) {
        const sql = `
            UPDATE footer_settings
            SET
                description = ?,
                address = ?,
                phone = ?,
                email = ?,
                whatsapp = ?,
                facebook = ?,
                instagram = ?,
                youtube = ?,
                twitter = ?,
                telegram = ?,
                copyright_text = ?,
                developer_text = ?
            WHERE id = 1
        `;

        const [result] = await db.query(sql, [
            data.description,
            data.address,
            data.phone,
            data.email,
            data.whatsapp,
            data.facebook,
            data.instagram,
            data.youtube,
            data.twitter,
            data.telegram,
            data.copyright_text,
            data.developer_text
        ]);

        return result;
    }
}

module.exports = FooterSetting;
