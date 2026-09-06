const db = require("../config/database");

class RtseAdmitCardSetting {

    static async get() {
        const [rows] = await db.query(
            `
                SELECT *
                FROM rtse_admit_card_settings
                WHERE id = 1
                LIMIT 1
            `
        );

        return rows[0] || null;
    }

    static async update(
        signatureImage,
        instructions
    ) {
        const values = Array.isArray(instructions)
            ? instructions.slice(0, 5)
            : [];

        while (values.length < 5) {
            values.push(null);
        }

        await db.query(
            `
                INSERT INTO rtse_admit_card_settings
                (
                    id,
                    signature_image,
                    instruction_1,
                    instruction_2,
                    instruction_3,
                    instruction_4,
                    instruction_5
                )
                VALUES (1, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    signature_image =
                        COALESCE(VALUES(signature_image), signature_image),
                    instruction_1 = VALUES(instruction_1),
                    instruction_2 = VALUES(instruction_2),
                    instruction_3 = VALUES(instruction_3),
                    instruction_4 = VALUES(instruction_4),
                    instruction_5 = VALUES(instruction_5)
            `,
            [
                signatureImage || null,
                values[0],
                values[1],
                values[2],
                values[3],
                values[4]
            ]
        );

        return await this.get();
    }
}

module.exports = RtseAdmitCardSetting;
