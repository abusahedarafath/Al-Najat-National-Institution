const db = require("../config/database");

class Student {

    static create(data, callback) {

        const sql = `
            INSERT INTO students (
                student_id,
                application_id,
                admission_no,
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
                pen_no,
                apaar_id,
                siksha_setu_id
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        db.query(sql, [
            data.student_id,
            data.application_id,
            data.admission_no,
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
            data.pen_no,
            data.apaar_id,
            data.siksha_setu_id
        ], callback);

    }

}

module.exports = Student;
