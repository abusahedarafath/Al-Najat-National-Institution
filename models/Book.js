const db = require("../config/database");

const Book = {

    // ======================================
    // Get All Books
    // ======================================

    async getAll() {

        const [rows] = await db.query(`
            SELECT
                b.*,
                bc.category_name
            FROM books b
            LEFT JOIN book_categories bc
                ON b.category_id = bc.id
            ORDER BY b.title ASC
        `);

        return rows;

    },

    // ======================================
    // Get Book By ID
    // ======================================

    async getById(id) {

        const [rows] = await db.query(
            `
            SELECT
                b.*,
                bc.category_name
            FROM books b
            LEFT JOIN book_categories bc
                ON b.category_id = bc.id
            WHERE b.id = ?
            `,
            [id]
        );

        return rows[0];

    },

    // ======================================
    // Create Book
    // ======================================

    async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO books
            (
                category_id,
                title,
                author,
                publisher,
                isbn,
                edition,
                quantity,
                available_quantity,
                shelf_no,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.category_id,
                data.title,
                data.author,
                data.publisher,
                data.isbn,
                data.edition,
                data.quantity,
                data.available_quantity,
                data.shelf_no,
                data.status
            ]
        );

        return result;

    },

    // ======================================
    // Update Book
    // ======================================

    async update(id, data) {

        const [result] = await db.query(
            `
            UPDATE books
            SET
                category_id=?,
                title=?,
                author=?,
                publisher=?,
                isbn=?,
                edition=?,
                quantity=?,
                available_quantity=?,
                shelf_no=?,
                status=?
            WHERE id=?
            `,
            [
                data.category_id,
                data.title,
                data.author,
                data.publisher,
                data.isbn,
                data.edition,
                data.quantity,
                data.available_quantity,
                data.shelf_no,
                data.status,
                id
            ]
        );

        return result;

    },

    // ======================================
    // Delete Book
    // ======================================

    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM books WHERE id=?",
            [id]
        );

        return result;

    },

    // ======================================
    // Available Books
    // ======================================

    async getAvailable() {

        const [rows] = await db.query(`
            SELECT *
            FROM books
            WHERE status='Available'
            ORDER BY title ASC
        `);

        return rows;

    }

};

module.exports = Book;
