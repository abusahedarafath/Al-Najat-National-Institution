const db = require("../config/database");




exports.createAdmission = (student, callback) => {

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

    db.query(sql, values, callback);
};







exports.getAllApplications = (callback) => {

    const sql = `
        SELECT *
        FROM applications
        ORDER BY id DESC
    `;

    db.query(sql, callback);

};




exports.getApplicationById = (id, callback) => {

    const sql = `
        SELECT *
        FROM applications
        WHERE id = ?
    `;

    db.query(sql, [id], callback);

};





exports.approveApplication = (id, callback) => {

    const sql = `
        UPDATE applications
        SET status = 'Approved'
        WHERE id = ?
    `;

    db.query(sql, [id], callback);

};




exports.getDashboardStats = (callback) => {

    const sql = `
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) AS rejected
        FROM applications
    `;

    db.query(sql, callback);

};




exports.getRecentApplications = (callback) => {

    const sql = `
        SELECT id, full_name, status
        FROM applications
        ORDER BY id DESC
        LIMIT 5
    `;

    db.query(sql, callback);

};






exports.createStudentFromApplication = (application, callback) => {

    const year = new Date().getFullYear();

    const studentId = "ANI" + year + String(application.id).padStart(4, "0");

    const username = application.mobile;

    const password = application.mobile;

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
            username,
            password
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)
    `;

    db.query(sql, [

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
        application.previous_school,
        username,
        password

    ], callback);

};






exports.getAllStudents = (callback) => {

    const sql = `
        SELECT *
        FROM students
        ORDER BY id DESC
    `;

    db.query(sql, callback);

};






exports.getStudentById = (id, callback) => {

    const sql = `
        SELECT *
        FROM students
        WHERE id = ?
    `;

    db.query(sql, [id], callback);

};







exports.getStudentForEdit = (id, callback) => {

    const sql = `
        SELECT *
        FROM students
        WHERE id = ?
    `;

    db.query(sql, [id], callback);

};





exports.updateStudent = (id, studentData, callback) => {

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

    db.query(sql, values, callback);

};







exports.updateStudent = (id, student, callback) => {

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

    db.query(sql, [
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
    ], callback);

};








exports.deactivateStudent = (id, callback) => {

    const sql = `
        UPDATE students
        SET status = 'Inactive'
        WHERE id = ?
    `;

    db.query(sql, [id], callback);

};
