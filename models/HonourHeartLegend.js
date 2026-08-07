const db = require("../config/database");

// =============================
// Get All
// =============================
exports.getAll = async () => {
    const [rows] = await db.query(
        `SELECT *
         FROM honour_heart_legends
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
         FROM honour_heart_legends
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
         FROM honour_heart_legends
         WHERE id=?`,
        [id]
    );

    return rows[0];
};

// =============================
// Get By Slug
// =============================
exports.getBySlug = async (slug) => {
    const [rows] = await db.query(
        `SELECT *
         FROM honour_heart_legends
         WHERE slug=?`,
        [slug]
    );

    return rows[0];
};

// =============================
// Create
// =============================
exports.create = async (data) => {

    const [result] = await db.query(

        `INSERT INTO honour_heart_legends
        (
            photo,
            name,
            designation,
            slug,
            biography,
            display_order,
            status
        )
        VALUES (?,?,?,?,?,?,?)`,

        [
            data.photo,
            data.name,
            data.designation,
            data.slug,
            data.biography,
            data.display_order,
            data.status
        ]
    );

    return result;

};

// =============================
// Update
// =============================
exports.update = async (id,data) => {

    const [result] = await db.query(

        `UPDATE honour_heart_legends
        SET

        photo=?,
        name=?,
        designation=?,
        slug=?,
        biography=?,
        display_order=?,
        status=?

        WHERE id=?`,

        [
            data.photo,
            data.name,
            data.designation,
            data.slug,
            data.biography,
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

        `DELETE
         FROM honour_heart_legends
         WHERE id=?`,

        [id]
    );

    return result;

};
