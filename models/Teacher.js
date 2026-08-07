const db = require("../config/database");

class Teacher {

    // ==========================
    // Get All Teachers
    // ==========================
    static async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM teachers
            ORDER BY id DESC
        `);

        return rows;
    }

    // ==========================
    // Get Teacher By ID
    // ==========================
    static async getById(id) {

        const [rows] = await db.query(
            "SELECT * FROM teachers WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    // ==========================
    // Create Teacher
    // ==========================
    static async create(data) {

        const [result] = await db.query(`
            INSERT INTO teachers (
                teacher_id,
                full_name,
                father_name,
                mother_name,
                gender,
                dob,
                mobile,
                email,
                address,
                qualification,
                subject,
                designation,
                joining_date,
                salary,
                photo,
                status
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
            data.teacher_id,
            data.full_name,
            data.father_name,
            data.mother_name,
            data.gender,
            data.dob,
            data.mobile,
            data.email,
            data.address,
            data.qualification,
            data.subject,
            data.designation,
            data.joining_date,
            data.salary,
            data.photo,
            data.status
        ]);

        return result;
    }

    // ==========================
    // Update Teacher
    // ==========================
    static async update(id, data) {

        const [result] = await db.query(`
            UPDATE teachers
            SET
                full_name=?,
                father_name=?,
                mother_name=?,
                gender=?,
                dob=?,
                mobile=?,
                email=?,
                address=?,
                qualification=?,
                subject=?,
                designation=?,
                joining_date=?,
                salary=?,
                photo=?,
                status=?
            WHERE id=?
        `, [
            data.full_name,
            data.father_name,
            data.mother_name,
            data.gender,
            data.dob,
            data.mobile,
            data.email,
            data.address,
            data.qualification,
            data.subject,
            data.designation,
            data.joining_date,
            data.salary,
            data.photo,
            data.status,
            id
        ]);

        return result;
    }

    // ==========================
    // Delete Teacher
    // ==========================
    static async delete(id) {

        const [result] = await db.query(
            "DELETE FROM teachers WHERE id = ?",
            [id]
        );

        return result;
    }

}

module.exports = Teacher;
