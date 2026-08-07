const db = require("../config/database");

const BookCategory = {

    // ======================================
    // Get All Categories
    // ======================================

    async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM book_categories
            ORDER BY category_name ASC
        `);

        return rows;

    },

    // ======================================
    // Get Category By ID
    // ======================================

    async getById(id) {

        const [rows] = await db.query(
            "SELECT * FROM book_categories WHERE id = ?",
            [id]
        );

        return rows[0];

    },

    // ======================================
    // Create Category
    // ======================================

    async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO book_categories
            (
                category_name,
                description
            )
            VALUES (?, ?)
            `,
            [
                data.category_name,
                data.description
            ]
        );

        return result;

    },

    // ======================================
    // Update Category
    // ======================================

    async update(id, data) {

        const [result] = await db.query(
            `
            UPDATE book_categories
            SET
                category_name = ?,
                description = ?
            WHERE id = ?
            `,
            [
                data.category_name,
                data.description,
                id
            ]
        );

        return result;

    },

    // ======================================
    // Delete Category
    // ======================================

    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM book_categories WHERE id = ?",
            [id]
        );

        return result;

    }

};

module.exports = BookCategory;
