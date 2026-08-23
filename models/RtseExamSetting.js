const db = require("../config/database");

class RtseExamSetting {

    // =====================================
    // Get All Examinations
    // =====================================

    static async getAll(){

        const [rows] = await db.query(
            `SELECT *
             FROM rtse_exam_settings
             ORDER BY exam_year DESC, id DESC`
        );

        return rows;
    }


    // =====================================
    // Get Examination By ID
    // =====================================

    static async getById(id){

        const [rows] = await db.query(
            `SELECT *
             FROM rtse_exam_settings
             WHERE id=?
             LIMIT 1`,
            [id]
        );

        return rows[0] || null;
    }


    // =====================================
    // Get Active Examination
    // =====================================

    static async getActive(){

        const [rows] = await db.query(
            `SELECT *
             FROM rtse_exam_settings
             WHERE status='ACTIVE'
             ORDER BY id DESC
             LIMIT 1`
        );

        return rows[0] || null;
    }


    // =====================================
    // Backward-Compatible Get
    //
    // Existing application code currently
    // expects RtseExamSetting.get()
    // =====================================

    static async get(){

        return await this.getActive();
    }


    // =====================================
    // Create Examination
    // =====================================

    static async create(data){

        const [result] = await db.query(

            `INSERT INTO rtse_exam_settings
            (
                exam_name,
                exam_year,
                exam_date,
                reporting_time,
                exam_start_time,
                exam_end_time,
                result_publish_date,
                certificate_publish_date,
                application_start_date,
                application_end_date,
                exam_centre,
                controller_name,
                status
            )
            VALUES
            (?,?,?,?,?,?,?,?,?,?,?,?,?)`,

            [
                data.exam_name,
                data.exam_year,
                data.exam_date || null,
                data.reporting_time || null,
                data.exam_start_time || null,
                data.exam_end_time || null,
                data.result_publish_date || null,
                data.certificate_publish_date || null,
                data.application_start_date || null,
                data.application_end_date || null,
                data.exam_centre || null,
                data.controller_name || null,
                data.status || "INACTIVE"
            ]

        );

        return await this.getById(result.insertId);
    }


    // =====================================
    // Update Examination
    // =====================================

    static async update(id, data){

        await db.query(

            `UPDATE rtse_exam_settings
             SET
                exam_name=?,
                exam_year=?,
                exam_date=?,
                reporting_time=?,
                exam_start_time=?,
                exam_end_time=?,
                result_publish_date=?,
                certificate_publish_date=?,
                application_start_date=?,
                application_end_date=?,
                exam_centre=?,
                controller_name=?
             WHERE id=?`,

            [
                data.exam_name,
                data.exam_year,
                data.exam_date || null,
                data.reporting_time || null,
                data.exam_start_time || null,
                data.exam_end_time || null,
                data.result_publish_date || null,
                data.certificate_publish_date || null,
                data.application_start_date || null,
                data.application_end_date || null,
                data.exam_centre || null,
                data.controller_name || null,
                id
            ]

        );

        return await this.getById(id);
    }


    // =====================================
    // Activate Examination
    //
    // Only one examination is active at
    // a time.
    // =====================================

    static async activate(id){

        const connection = await db.getConnection();

        try{

            await connection.beginTransaction();

            await connection.query(
                `UPDATE rtse_exam_settings
                 SET status='INACTIVE'
                 WHERE status='ACTIVE'`
            );

            await connection.query(
                `UPDATE rtse_exam_settings
                 SET status='ACTIVE'
                 WHERE id=?`,
                [id]
            );

            await connection.commit();

        }catch(err){

            await connection.rollback();
            throw err;

        }finally{

            connection.release();

        }

        return await this.getById(id);
    }


    // =====================================
    // Deactivate Examination
    // =====================================

    static async deactivate(id){

        await db.query(
            `UPDATE rtse_exam_settings
             SET status='INACTIVE'
             WHERE id=?`,
            [id]
        );

        return await this.getById(id);
    }


    // =====================================
    // Delete Examination
    //
    // Safe deletion check.
    // Do not delete an examination that
    // already has RTSE application data.
    // =====================================

    static async delete(id){

        const [examRows] = await db.query(
            `SELECT exam_year
             FROM rtse_exam_settings
             WHERE id=?
             LIMIT 1`,
            [id]
        );

        if(!examRows.length){

            throw new Error(
                "Examination not found."
            );

        }

        const examYear = examRows[0].exam_year;

        const [applicationRows] = await db.query(
            `SELECT COUNT(*) AS total
             FROM rtse_applications
             WHERE application_year=?`,
            [examYear]
        );

        if(
            applicationRows[0] &&
            Number(applicationRows[0].total) > 0
        ){

            throw new Error(
                `Cannot delete this examination because ${applicationRows[0].total} RTSE application record(s) exist for ${examYear}. Deactivate it instead.`
            );

        }

        await db.query(
            `DELETE FROM rtse_exam_settings
             WHERE id=?`,
            [id]
        );

        return true;
    }

}

module.exports = RtseExamSetting;
