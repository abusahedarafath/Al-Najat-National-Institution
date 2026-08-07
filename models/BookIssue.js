const db = require("../config/database");

const BookIssue = {

    // ======================================
    // Get All Issued Books
    // ======================================

    async getAll() {

        const [rows] = await db.query(`
            SELECT
                bi.*,
                b.title AS book_title,
                s.full_name AS student_name,
                s.student_id
            FROM book_issues bi
            LEFT JOIN books b
                ON bi.book_id = b.id
            LEFT JOIN students s
                ON bi.student_id = s.id
            ORDER BY bi.issue_date DESC
        `);

        return rows;

    },

    // ======================================
    // Get Issue By ID
    // ======================================

    async getById(id) {

        const [rows] = await db.query(
            `
            SELECT
                bi.*,
                b.title AS book_title,
                b.author,
                s.full_name AS student_name,
                s.student_id
            FROM book_issues bi
            LEFT JOIN books b
                ON bi.book_id = b.id
            LEFT JOIN students s
                ON bi.student_id = s.id
            WHERE bi.id = ?
            `,
            [id]
        );

        return rows[0];

    },

    // ======================================
    // Issue Book
    // ======================================

    async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO book_issues
            (
                book_id,
                student_id,
                issue_date,
                due_date,
                return_date,
                status,
                remarks
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.book_id,
                data.student_id,
                data.issue_date,
                data.due_date,
                data.return_date || null,
                data.status || "Issued",
                data.remarks || null
            ]
        );

        return result;

    },

    // ======================================
    // Update Issue
    // ======================================

    async update(id, data) {

        const [result] = await db.query(
            `
            UPDATE book_issues
            SET
                book_id=?,
                student_id=?,
                issue_date=?,
                due_date=?,
                return_date=?,
                status=?,
                remarks=?
            WHERE id=?
            `,
            [
                data.book_id,
                data.student_id,
                data.issue_date,
                data.due_date,
                data.return_date,
                data.status,
                data.remarks,
                id
            ]
        );

        return result;

    },

    // ======================================
    // Return Book
    // ======================================

    async returnBook(id, returnDate) {

        const [result] = await db.query(
            `
            UPDATE book_issues
            SET
                return_date=?,
                status='Returned'
            WHERE id=?
            `,
            [
                returnDate,
                id
            ]
        );

        return result;

    },

    // ======================================
    // Delete
    // ======================================

    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM book_issues WHERE id=?",
            [id]
        );

        return result;

    },

    // ======================================
    // Issued Books
    // ======================================

    async getIssuedBooks() {

        const [rows] = await db.query(`
            SELECT *
            FROM book_issues
            WHERE status='Issued'
            ORDER BY due_date ASC
        `);

        return rows;

    }

};

module.exports = BookIssue;
