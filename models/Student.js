const db = require("../config/database");

const Student = {




    async getNextStudentNumber() {
        const year = new Date().getFullYear();

        const [rows] = await db.query(
            `
            SELECT student_id
            FROM students
            WHERE student_id LIKE ?
            ORDER BY CAST(RIGHT(student_id,4) AS UNSIGNED) DESC
            LIMIT 1
            `,
            [`ANI${year}%`]
        );

        let next = 1;

        if (rows.length > 0) {
            const lastId = rows[0].student_id;
            const number = parseInt(lastId.slice(-4), 10);

            if (!isNaN(number)) {
                next = number + 1;
            }
        }

        return `ANI${year}${String(next).padStart(4, "0")}`;
    },





    async create(student) {
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
                status,
                photo
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            student.student_id,
            student.application_id,
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
            student.admission_date,
            student.status,
            student.photo
        ]);  
          return result;
    },





    async getAll() {
        const [rows] = await db.query(`
            SELECT *
            FROM students
            ORDER BY id DESC
        `);

        return rows;
    },





    async getById(id) {
        const [rows] = await db.query(
            `
            SELECT *
            FROM students
            WHERE id = ?
            `,
            [id]
        );

        return rows[0] || null;
    },





    async findByStudentId(studentId) {
        const [rows] = await db.query(
            `
            SELECT *
            FROM students
            WHERE student_id = ?
            LIMIT 1
            `,
            [studentId]
        );

        return rows[0] || null;
    },





    async findByApplicationId(applicationId) {
        const [rows] = await db.query(
            `
            SELECT *
            FROM students
            WHERE application_id = ?
            LIMIT 1
            `,
            [applicationId]
        );

        return rows[0] || null;
    },




async update(id, student) {
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
            status = ?,
            photo = COALESCE(?, photo)
        WHERE id = ?
    `;

    const [result] = await db.query(sql, [
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
        student.photo || null,
        id
    ]);

    return result;
},




    async deactivate(id) {
        const [result] = await db.query(
            `
            UPDATE students
            SET status = 'Inactive'
            WHERE id = ?
            `,
            [id]
        );

        return result;
    },





    async delete(id) {
        const [result] = await db.query(
            `
            DELETE FROM students
            WHERE id = ?
            `,
            [id]
        );

        return result;
    },



async deletePermanent(id) {
    return this.delete(id);
},

async createFromApplication(application, photo = null) {
    const studentId = await this.getNextStudentNumber();

    return this.create({
        student_id: studentId,
        application_id: application.id,
        full_name: application.full_name,
        father_name: application.father_name,
        mother_name: application.mother_name,
        dob: application.dob,
        gender: application.gender,
        mobile: application.mobile,
        email: application.email,
        address: application.address,
        course: application.course,
        previous_school: application.previous_school,
        admission_date: new Date(),
        status: "Active",
        photo: photo
    });
}
};





module.exports = Student;
