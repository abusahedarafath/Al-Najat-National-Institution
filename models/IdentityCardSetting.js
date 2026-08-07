const db = require("../config/database");

class IdentityCardSetting {

    static async get() {

        const [rows] = await db.query(
            `SELECT
                id,
                background,
                qr_enabled,
                card_width,
                card_height
             FROM identity_card_settings
             LIMIT 1`
        );

        return rows[0] || null;

    }

    static async save(data) {

        const setting = await this.get();

        if (setting) {

            await db.query(
                `UPDATE identity_card_settings
                 SET
                    background = ?,
                    qr_enabled = ?,
                    card_width = ?,
                    card_height = ?
                 WHERE id = ?`,
                [
                    data.background,
                    data.qr_enabled,
                    data.card_width,
                    data.card_height,
                    setting.id
                ]
            );

        } else {

            await db.query(
                `INSERT INTO identity_card_settings
                (
                    background,
                    qr_enabled,
                    card_width,
                    card_height
                )
                VALUES (?, ?, ?, ?)`,
                [
                    data.background,
                    data.qr_enabled,
                    data.card_width,
                    data.card_height
                ]
            );

        }

    }

}

module.exports = IdentityCardSetting;
