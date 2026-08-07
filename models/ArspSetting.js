const db = require("../config/database");

class ArspSetting {

    // ==========================
    // Get Settings
    // ==========================

    static async get() {

        const [rows] = await db.query(
            "SELECT * FROM arsp_settings LIMIT 1"
        );

        return rows[0] || null;

    }

    // ==========================
    // Update Settings
    // ==========================

    static async update(data) {

        const sql = `
         UPDATE arsp_settings
SET
    organization_name=?,
    short_name=?,
    tagline=?,
    logo=?,
    president_signature=?,
    official_seal=?,
    favicon=?,
    primary_color=?,
    secondary_color=?,
    address=?,
    email=?,
    phone=?,
    website=?,
    facebook=?,
    youtube=?,
    whatsapp=?,
    established_year=?,
    footer_text=?
WHERE id=1
        `;

        const [result] = await db.query(sql, [

            data.organization_name,
            data.short_name,
            data.tagline,
            data.logo,
data.president_signature,
data.official_seal,
data.favicon,
data.primary_color,
            data.secondary_color,
            data.address,
            data.email,
            data.phone,
            data.website,
            data.facebook,
            data.youtube,
            data.whatsapp,
            data.established_year,
            data.footer_text

        ]);

        return result;

    }

}

module.exports = ArspSetting;
