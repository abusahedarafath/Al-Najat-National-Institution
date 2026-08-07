const db = require("../config/database");

// ===============================
// Get All
// ===============================
exports.getAll = async () => {

    const [rows] = await db.query(`
        SELECT *
        FROM chairman_message
        ORDER BY display_order ASC, id DESC
    `);

    return rows;
};

// ===============================
// Get Active
// ===============================
exports.get = async () => {

    const [rows] = await db.query(`
        SELECT *
        FROM chairman_message
        WHERE status='Active'
        ORDER BY display_order ASC, id DESC
        LIMIT 1
    `);

    return rows;
};

// ===============================
// Get By ID
// ===============================
exports.getById = async (id) => {

    const [rows] = await db.query(
        "SELECT * FROM chairman_message WHERE id=?",
        [id]
    );

    return rows[0];
};

// ===============================
// Create
// ===============================
exports.create = async (data) => {

    const sql = `
        INSERT INTO chairman_message
        (
            name,
            designation,
            message,
            image,
            display_order,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
        data.name,
        data.designation,
        data.message,
        data.image,
        data.display_order || 1,
        data.status || "Active"
    ]);

    return result;
};

// ===============================
// Update
// ===============================
exports.update = async (id, data) => {

    const sql = `
        UPDATE chairman_message
        SET
            name=?,
            designation=?,
            message=?,
            image=?,
            display_order=?,
            status=?
        WHERE id=?
    `;

    const [result] = await db.query(sql, [
        data.name,
        data.designation,
        data.message,
        data.image,
        data.display_order,
        data.status,
        id
    ]);

    return result;
};

// ===============================
// Delete
// ===============================
exports.delete = async (id) => {

    const [result] = await db.query(
        "DELETE FROM chairman_message WHERE id=?",
        [id]
    );

    return result;
};
