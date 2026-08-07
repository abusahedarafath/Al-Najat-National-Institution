const db = require("../config/database");

// =============================
// Get All
// =============================
exports.getAll = async () => {

    const [rows] = await db.query(
        `SELECT *
         FROM honour_heart_selection_board
         ORDER BY display_order ASC`
    );

    return rows;

};

// =============================
// Get Active
// =============================
exports.getActive = async () => {

    const [rows] = await db.query(
        `SELECT *
         FROM honour_heart_selection_board
         WHERE status='Active'
         ORDER BY display_order ASC`
    );

    return rows;

};

// =============================
// Get By ID
// =============================
exports.getById = async (id) => {

    const [rows] = await db.query(
        `SELECT *
         FROM honour_heart_selection_board
         WHERE id=?`,
        [id]
    );

    return rows[0];

};

// =============================
// Create
// =============================
exports.create = async (data) => {

    const [result] = await db.query(

        `INSERT INTO honour_heart_selection_board
        (
            photo,
            name,
            designation,
            organisation,
            display_order,
            status
        )
        VALUES (?,?,?,?,?,?)`,

        [
            data.photo,
            data.name,
            data.designation,
            data.organisation,
            data.display_order,
            data.status
        ]

    );

    return result;

};

// =============================
// Update
// =============================
exports.update = async (id, data) => {

    const [result] = await db.query(

        `UPDATE honour_heart_selection_board
        SET
            photo=?,
            name=?,
            designation=?,
            organisation=?,
            display_order=?,
            status=?
        WHERE id=?`,

        [
            data.photo,
            data.name,
            data.designation,
            data.organisation,
            data.display_order,
            data.status,
            id
        ]

    );

    return result;

};

// =============================
// Delete
// =============================
exports.delete = async (id) => {

    const [result] = await db.query(

        `DELETE FROM honour_heart_selection_board
         WHERE id=?`,

        [id]

    );

    return result;

};
