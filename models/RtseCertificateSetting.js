const db = require("../config/database");

class RtseCertificateSetting {
    static async get() {
        const [rows] = await db.query(
            `SELECT *
             FROM rtse_certificate_settings
             ORDER BY id ASC
             LIMIT 1`
        );

        return rows[0] || null;
    }

    static async update(data) {
        const existing = await this.get();

        if (!existing) {
            await db.query(
                `INSERT INTO rtse_certificate_settings
                    (
                        exam_name,
                        organized_by,
                        organized_by_label,
                        left_signature,
                        left_signature_label,
                        right_signature,
                        right_signature_label
                    )
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.exam_name,
                    data.organized_by,
                    data.organized_by_label || "Organized by",
                    data.left_signature || null,
                    data.left_signature_label,
                    data.right_signature || null,
                    data.right_signature_label
                ]
            );

            return;
        }

        await db.query(
            `UPDATE rtse_certificate_settings
             SET
                exam_name=?,
                organized_by=?,
                organized_by_label=?,
                left_signature=?,
                left_signature_label=?,
                right_signature=?,
                right_signature_label=?
             WHERE id=?`,
            [
                data.exam_name,
                data.organized_by,
                data.organized_by_label || "Organized by",
                data.left_signature || null,
                data.left_signature_label,
                data.right_signature || null,
                data.right_signature_label,
                existing.id
            ]
        );
    }
}

module.exports = RtseCertificateSetting;
