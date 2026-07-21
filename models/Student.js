const db = require("../config/database");

class Student {

    // ===============================
    // Generate Next Student Number
    // ===============================
    static getNextStudentNumber(callback) {

        const sql = `
            SELECT COUNT(*) AS total
            FROM students
        `;

        db.query(sql, (err, rows) => {
            if (err) return callback(err);

            const nextNumber = (rows[0].total || 0) + 1;
            callback(null, nextNumber);
        });

    }

    // ===============================
    // Create Student
    // ===============================
    static create(data, callback) {

        const sql = `
            INSERT INTO students
            (
                student_id,
                application_id,
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
                admission_date,
                status
            )
            VALUES
            (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?
            )
        `;

        db.query(
            sql,
            [
                data.student_id,
                data.application_id,
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
                data.status || "Active"
            ],
            callback
        );

    }

    // ===============================
    // Get All Students
    // ===============================
    static getAll(callback) {

        db.query(
            "SELECT * FROM students ORDER BY id DESC",
            callback
        );

    }

    // ===============================
    // Get Student By ID
    // ===============================
    static getById(id, callback) {

        db.query(
            "SELECT * FROM students WHERE id = ?",
            [id],
            callback
        );

    }

    // ===============================
    // Find Student By Student ID
    // ===============================
    static findByStudentId(studentId, callback) {

        db.query(
            "SELECT * FROM students WHERE student_id = ? LIMIT 1",
            [studentId],
            callback
        );

    }

    // ===============================
    // Check Existing Student
    // ===============================
    static findByApplicationId(applicationId, callback) {

        db.query(
            "SELECT * FROM students WHERE application_id = ? LIMIT 1",
            [applicationId],
            callback
        );

    }

    // ===============================
    // Update Student
    // ===============================
    static update(id, student, callback) {

        const sql = `
            UPDATE students
            SET
                full_name = ?,
                father_name = ?,
                mother_name = ?,
                dob = ?,
                gender = ?,
                mobile = ?,
                email = ?,
                address = ?,
                course = ?,
                previous_school = ?,
                status = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                student.full_name,
                student.father_name,
                student.mother_name,
                student.dob,
                student.gender,
                student.mobile,
                student.email,
                student.address,
                student.course,
                student.previous_school,
                student.status,
                id
            ],
            callback
        );

    }

    // ===============================
    // Deactivate Student
    // ===============================
    static deactivate(id, callback) {

        db.query(
            "UPDATE students SET status = 'Inactive' WHERE id = ?",
            [id],
            callback
        );

    }

}

module.exports = Student;
