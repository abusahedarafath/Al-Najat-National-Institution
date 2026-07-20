const db = require("../config/database");

class Application {

    // ==========================
    // Create New Application
    // ==========================
    static create(data, callback) {

        const sql = `
            INSERT INTO applications (
                application_no,
                session,
                full_name,
                father_name,
                mother_name,
                dob,
                gender,
                mobile,
                email,
                address,
                course,
                previous_school,
                pen_no,
                apaar_id,
                siksha_setu_id,
                status
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        db.query(sql, [
            data.application_no,
            data.session,
            data.full_name,
            data.father_name,
            data.mother_name,
            data.dob,
            data.gender,
            data.mobile,
            data.email,
            data.address,
            data.course,
            data.previous_school,
            data.pen_no,
            data.apaar_id,
            data.siksha_setu_id,
            "Pending"
        ], callback);

    }

    // ==========================
    // Get All Applications
    // ==========================
    static getAll(callback) {

        const sql = `
            SELECT
                id,
                application_no,
                full_name,
                mobile,
                course,
                status,
                created_at
            FROM applications
            ORDER BY id DESC
        `;

        db.query(sql, callback);

    }

    // ==========================
    // Get Last Application
    // ==========================
    static getLastApplication(callback) {

        const sql = `
            SELECT application_no
            FROM applications
            ORDER BY id DESC
            LIMIT 1
        `;

        db.query(sql, callback);

    }

    // ==========================
    // Get Application By ID
    // ==========================
    static getById(id, callback) {

        const sql = `
            SELECT *
            FROM applications
            WHERE id = ?
        `;

        db.query(sql, [id], callback);

    }

}

module.exports = Application;
