const db = require("../config/database");

// Get all personalities
exports.getAll = async () => {
    const [rows] = await db.query(
        "SELECT * FROM institutional_personalities ORDER BY display_order ASC"
    );
    return rows;
};

// Get homepage personalities
exports.getHomepage = async () => {
    const [rows] = await db.query(`
        SELECT *
        FROM institutional_personalities
        WHERE status='Active'
        AND show_homepage='Yes'
        ORDER BY display_order ASC
    `);
    return rows;
};

// Get by ID
exports.getById = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM institutional_personalities WHERE id=?",
        [id]
    );
    return rows[0];
};

// Get by Slug
exports.getBySlug = async (slug) => {
    const [rows] = await db.query(
        "SELECT * FROM institutional_personalities WHERE slug=?",
        [slug]
    );
    return rows[0];
};

// Insert
exports.create = async (data) => {
    const [result] = await db.query(
        `INSERT INTO institutional_personalities
        (
            photo,
            message_title,
            name,
            designation,
            slug,
            message,
            biography,
            message_button_text,
            biography_button_text,
            show_homepage,
            display_order,
            status
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
            data.photo,
            data.message_title,
            data.name,
            data.designation,
            data.slug,
            data.message,
            data.biography,
            data.message_button_text,
            data.biography_button_text,
            data.show_homepage,
            data.display_order,
            data.status
        ]
    );

    return result;
};

// Update
exports.update = async (id, data) => {
    const [result] = await db.query(
        `UPDATE institutional_personalities SET
            photo=?,
            message_title=?,
            name=?,
            designation=?,
            slug=?,
            message=?,
            biography=?,
            message_button_text=?,
            biography_button_text=?,
            show_homepage=?,
            display_order=?,
            status=?
        WHERE id=?`,
        [
            data.photo,
            data.message_title,
            data.name,
            data.designation,
            data.slug,
            data.message,
            data.biography,
            data.message_button_text,
            data.biography_button_text,
            data.show_homepage,
            data.display_order,
            data.status,
            id
        ]
    );

    return result;
};

// Delete
exports.delete = async (id) => {
    const [result] = await db.query(
        "DELETE FROM institutional_personalities WHERE id=?",
        [id]
    );

    return result;
};
