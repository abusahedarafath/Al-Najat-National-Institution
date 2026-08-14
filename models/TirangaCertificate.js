const db = require("../config/database");

const TirangaCertificate = {

    async getSettings() {

        const [rows] = await db.query(`
            SELECT *
            FROM tiranga_certificate_settings
            WHERE id = 1
            LIMIT 1
        `);

        return rows[0] || null;
    },

    async updateSettings(data) {

        await db.query(`
            UPDATE tiranga_certificate_settings
            SET
                enabled=?,
                organization_name=?,
                certificate_title=?,
                independence_text=?,
                independence_years=?,
                presented_text=?,
                description=?,
                event_date=?,
                footer_text=?,
                signature_name=?,
                signature_designation=?
            WHERE id=1
        `, [
            data.enabled ? 1 : 0,
            data.organization_name,
            data.certificate_title,
            data.independence_text,
            data.independence_years,
            data.presented_text,
            data.description,
            data.event_date,
            data.footer_text,
            data.signature_name,
            data.signature_designation
        ]);

        return this.getSettings();
    },

    async updateImage(field, filename) {

        const allowed = [
            "logo",
            "background_image",
            "signature_image"
        ];

        if (!allowed.includes(field)) {
            throw new Error("Invalid image field");
        }

        await db.query(
            `UPDATE tiranga_certificate_settings
             SET ${field}=?
             WHERE id=1`,
            [filename]
        );

        return this.getSettings();
    },

    async generateCertificateNo() {

        const [rows] = await db.query(`
            SELECT id
            FROM tiranga_certificates
            ORDER BY id DESC
            LIMIT 1
        `);

        const next = rows.length ? rows[0].id + 1 : 1;

        return "TIRANGA-" + String(next).padStart(6, "0");
    },

    async createCertificate(data) {

        const [result] = await db.query(`
            INSERT INTO tiranga_certificates
            (
                certificate_no,
                full_name,
                father_name,
                village_name,
                post_office,
                police_station,
                mobile
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            data.certificate_no,
            data.full_name,
            data.father_name,
            data.village_name,
            data.post_office,
            data.police_station,
            data.mobile
        ]);

        return result;
    },

    async getAllCertificates() {

        const [rows] = await db.query(`
            SELECT *
            FROM tiranga_certificates
            ORDER BY issue_date DESC
        `);

        return rows;
    },


};

module.exports = TirangaCertificate;
