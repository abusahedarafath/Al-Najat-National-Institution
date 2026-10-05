const db = require("../config/database");

class RtseCertificateCategorySetting {
    static async getAll() {
        const [rows] = await db.query(
            `SELECT *
             FROM rtse_certificate_category_settings
             ORDER BY FIELD(category_key, 'rank1', 'rank2', 'rank3', 'merit', 'appreciation')`
        );

        return rows;
    }

    static async getByCategory(categoryKey) {
        const [rows] = await db.query(
            `SELECT *
             FROM rtse_certificate_category_settings
             WHERE category_key=?`,
            [categoryKey]
        );

        return rows[0] || null;
    }

    static async update(categoryKey, certificateName, certificateDescription) {
        await db.query(
            `UPDATE rtse_certificate_category_settings
             SET
                certificate_name=?,
                certificate_description=?
             WHERE category_key=?`,
            [
                certificateName,
                certificateDescription,
                categoryKey
            ]
        );
    }
}

module.exports = RtseCertificateCategorySetting;
