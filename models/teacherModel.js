const db = require("../config/database");
exports.getAll = async () => {

    const [rows] = await db.query(
        "SELECT * FROM teachers ORDER BY id DESC"
    );

    return rows;

};

exports.getById = async (id) => {

    const [rows] = await db.query(
        "SELECT * FROM teachers WHERE id=?",
        [id]
    );

    return rows[0];

};

exports.create = async (teacher) => {

    const sql = `
        INSERT INTO teachers
        (
            teacher_id,
            full_name,
            gender,
            dob,
            mobile,
            email,
            qualification,
            designation,
            department,
            joining_date,
            experience,
            salary,
            address,
            photo,
            status
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return db.query(sql, [

        teacher.teacher_id,
        teacher.full_name,
        teacher.gender,
        teacher.dob,
        teacher.mobile,
        teacher.email,
        teacher.qualification,
        teacher.designation,
        teacher.department,
        teacher.joining_date,
        teacher.experience,
        teacher.salary,
        teacher.address,
        teacher.photo,
        teacher.status

    ]);

};

exports.update = async (id, teacher) => {

    const sql = `
        UPDATE teachers
        SET
        full_name=?,
        gender=?,
        dob=?,
        mobile=?,
        email=?,
        qualification=?,
        designation=?,
        department=?,
        joining_date=?,
        experience=?,
        salary=?,
        address=?,
        photo=?,
        status=?
        WHERE id=?
    `;

    return db.query(sql, [

        teacher.full_name,
        teacher.gender,
        teacher.dob,
        teacher.mobile,
        teacher.email,
        teacher.qualification,
        teacher.designation,
        teacher.department,
        teacher.joining_date,
        teacher.experience,
        teacher.salary,
        teacher.address,
        teacher.photo,
        teacher.status,
        id

    ]);

};

exports.delete = async (id) => {

    return db.query(
        "DELETE FROM teachers WHERE id=?",
        [id]
    );

};
