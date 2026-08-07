const db = require("../config/database");

// =============================
// Get Settings
// =============================
exports.get = async () => {

    const [rows] = await db.query(

        `SELECT *
         FROM honour_heart_settings
         LIMIT 1`

    );

    return rows[0];

};

// =============================
// Update Settings
// =============================
exports.update = async (data) => {

    const [result] = await db.query(

        `UPDATE honour_heart_settings
        SET

        about_title=?,
        about_description=?,
        hero_banner=?,
        popup_title=?,
        popup_description=?,
        popup_enabled=?

        WHERE id=1`,

        [
            data.about_title,
            data.about_description,
            data.hero_banner,
            data.popup_title,
            data.popup_description,
            data.popup_enabled
        ]

    );

    return result;

};
