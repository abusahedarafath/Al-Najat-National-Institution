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
            popup_title=?,
            popup_description=?,
            popup_enabled=?,

            identity_eyebrow=?,
            identity_title=?,
            identity_tagline=?,
            identity_description=?,
            identity_primary_text=?,
            identity_primary_url=?,
            identity_secondary_text=?,
            identity_secondary_url=?,

            selection_eyebrow=?,
            selection_title=?,
            selection_description=?,
            selection_button_text=?,
            selection_button_url=?,
            selection_note=?,

            legacy_eyebrow=?,
            legacy_title=?,
            legacy_description=?,
            legacy_button_text=?,
            legacy_button_url=?,

            principle_1_icon=?,
            principle_1_title=?,
            principle_1_description=?,

            principle_2_icon=?,
            principle_2_title=?,
            principle_2_description=?,

            principle_3_icon=?,
            principle_3_title=?,
            principle_3_description=?,

            principle_4_icon=?,
            principle_4_title=?,
            principle_4_description=?,

            principle_5_icon=?,
            principle_5_title=?,
            principle_5_description=?,

            secretariat_eyebrow=?,
            secretariat_title=?,
            secretariat_description=?,
            secretariat_primary_text=?,
            secretariat_primary_url=?,
            secretariat_secondary_text=?,
            secretariat_secondary_url=?

         WHERE id=1`,
        [
            data.about_title,
            data.about_description,
            data.popup_title,
            data.popup_description,
            data.popup_enabled,

            data.identity_eyebrow,
            data.identity_title,
            data.identity_tagline,
            data.identity_description,
            data.identity_primary_text,
            data.identity_primary_url,
            data.identity_secondary_text,
            data.identity_secondary_url,

            data.selection_eyebrow,
            data.selection_title,
            data.selection_description,
            data.selection_button_text,
            data.selection_button_url,
            data.selection_note,

            data.legacy_eyebrow,
            data.legacy_title,
            data.legacy_description,
            data.legacy_button_text,
            data.legacy_button_url,

            data.principle_1_icon,
            data.principle_1_title,
            data.principle_1_description,

            data.principle_2_icon,
            data.principle_2_title,
            data.principle_2_description,

            data.principle_3_icon,
            data.principle_3_title,
            data.principle_3_description,

            data.principle_4_icon,
            data.principle_4_title,
            data.principle_4_description,

            data.principle_5_icon,
            data.principle_5_title,
            data.principle_5_description,

            data.secretariat_eyebrow,
            data.secretariat_title,
            data.secretariat_description,
            data.secretariat_primary_text,
            data.secretariat_primary_url,
            data.secretariat_secondary_text,
            data.secretariat_secondary_url
        ]
    );

    return result;
};
