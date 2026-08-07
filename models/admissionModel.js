// models/admissionModel.js

const db = require("../config/database");

// ===============================
// CREATE NEW ADMISSION
// ===============================

exports.createAdmission = async (student) => {

    const sql = `
        INSERT INTO applications
        (
            full_name,
            father_name,
            mother_name,
            dob,
            gender,
            mobile,
            email,
            address,
            course,
            previous_school
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        student.full_name,
        student.father_name,
        student.mother_name,
        student.dob,
        student.gender,
        student.mobile,
        student.email,
        student.address,
        student.course,
        student.previous_school
    ];

    const [result] = await db.query(sql, values);

    return result;
};


// ===============================
// GET ALL APPLICATIONS
// ===============================

exports.getAllApplications = async () => {

    const sql = `
        SELECT *
        FROM applications
        ORDER BY id DESC
    `;

    const [rows] = await db.query(sql);

    return rows;
};


// ===============================
// GET APPLICATION BY ID
// ===============================

exports.getApplicationById = async (id) => {

    const sql = `
        SELECT *
        FROM applications
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [id]);

    return rows[0];
};


// ===============================
// APPROVE APPLICATION
// ===============================

exports.approveApplication = async (id) => {

    const sql = `
        UPDATE applications
        SET status = 'Approved'
        WHERE id = ?
    `;

    const [result] = await db.query(sql, [id]);

    return result;
};


// ===============================
// DASHBOARD STATISTICS
// ===============================

exports.getDashboardStats = async () => {

    const sql = `
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) AS rejected
        FROM applications
    `;

    const [rows] = await db.query(sql);

    return rows[0];
};


// ===============================
// RECENT APPLICATIONS
// ===============================

exports.getRecentApplications = async () => {

    const sql = `
        SELECT
            id,
            full_name,
            status
        FROM applications
        ORDER BY id DESC
        LIMIT 5
    `;

    const [rows] = await db.query(sql);

    return rows;
};



// ===============================
// CREATE STUDENT FROM APPLICATION
// ===============================

exports.createStudentFromApplication = async (application) => {

    const year = new Date().getFullYear();
    const studentId = "ANI" + year + String(application.id).padStart(4, "0");

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
            admission_date
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
    `;

    const values = [
        studentId,
        application.id,
        application.full_name,
        application.father_name,
        application.mother_name,
        application.dob,
        application.gender,
        application.mobile,
        application.email,
        application.address,
        application.course,
        application.previous_school
    ];

    const [result] = await db.query(sql, values);

    return result;
};


// ===============================
// GET ALL STUDENTS
// ===============================

exports.getAllStudents = async () => {

    const sql = `
        SELECT *
        FROM students
        ORDER BY id DESC
    `;

    const [rows] = await db.query(sql);

    return rows;
};


// ===============================
// GET STUDENT BY ID
// ===============================

exports.getStudentById = async (id) => {

    const sql = `
        SELECT *
        FROM students
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [id]);

    return rows[0];
};


// ===============================
// GET STUDENT FOR EDIT
// ===============================

exports.getStudentForEdit = async (id) => {

    return await exports.getStudentById(id);

};




// ===============================
// UPDATE STUDENT
// ===============================

exports.updateStudent = async (id, studentData) => {

    let sql;
    let values;

    if (studentData.photo) {

        sql = `
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
                photo = ?
            WHERE id = ?
        `;

        values = [
            studentData.full_name,
            studentData.father_name,
            studentData.mother_name,
            studentData.dob,
            studentData.gender,
            studentData.mobile,
            studentData.email,
            studentData.address,
            studentData.course,
            studentData.previous_school,
            studentData.status,
            studentData.photo,
            id
        ];

    } else {

        sql = `
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

        values = [
            studentData.full_name,
            studentData.father_name,
            studentData.mother_name,
            studentData.dob,
            studentData.gender,
            studentData.mobile,
            studentData.email,
            studentData.address,
            studentData.course,
            studentData.previous_school,
            studentData.status,
            id
        ];

    }

    const [result] = await db.query(sql, values);

    return result;
};


// ===============================
// DEACTIVATE STUDENT
// ===============================

exports.deactivateStudent = async (id) => {

    const sql = `
        UPDATE students
        SET status = 'Inactive'
        WHERE id = ?
    `;

    const [result] = await db.query(sql, [id]);

    return result;
};


