const db = require("../config/database");

class RtseExamSetting {

    // ===========================
    // Get Settings
    // ===========================

    static async get(){

        const [rows] = await db.query(

            `SELECT *
             FROM rtse_exam_settings
             LIMIT 1`

        );

        return rows[0] || null;

    }

    // ===========================
// Save Settings
// ===========================

static async save(data){

    await db.query(

        `UPDATE rtse_exam_settings

         SET

            exam_name=?,
            exam_year=?,
            application_start_date=?,
            application_end_date=?,
            exam_date=?,
            reporting_time=?,
            exam_start_time=?,
            exam_end_time=?,
            result_publish_date=?,
            certificate_publish_date=?,
            exam_centre=?,
            controller_name=?

         WHERE id=1`,

        [

            data.exam_name,
            data.exam_year,
            data.application_start_date,
            data.application_end_date,
            data.exam_date,
            data.reporting_time,
            data.exam_start_time,
            data.exam_end_time,
            data.result_publish_date,
            data.certificate_publish_date,
            data.exam_centre,
            data.controller_name

        ]

    );

}

}

module.exports = RtseExamSetting;



