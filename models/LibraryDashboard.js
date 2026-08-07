const db = require("../config/database");

const LibraryDashboard = {

    // ======================================
    // Dashboard Statistics
    // ======================================

    async getDashboardStats() {

        const sql = `
            SELECT
                (SELECT COUNT(*) FROM books) AS total_books,

                (SELECT IFNULL(SUM(available_quantity),0)
                 FROM books) AS available_books,

                (SELECT COUNT(*)
                 FROM book_issues
                 WHERE status='Issued') AS issued_books,

                (SELECT COUNT(*)
                 FROM book_issues
                 WHERE status='Issued'
                 AND due_date<CURDATE()) AS overdue_books,

                (SELECT COUNT(*)
                 FROM books
                 WHERE status='Lost') AS lost_books,

                (SELECT COUNT(*)
                 FROM books
                 WHERE status='Damaged') AS damaged_books,

                (SELECT IFNULL(SUM(fine_amount),0)
                 FROM book_issues
                 WHERE status='Returned') AS total_fine_collection
        `;

        const [rows] = await db.query(sql);

        return rows[0];

    },

    // ======================================
    // Today's Issues
    // ======================================

    async getTodayIssues() {

        const sql = `
            SELECT
                bi.*,
                b.title,
                s.full_name
            FROM book_issues bi
            LEFT JOIN books b
                ON bi.book_id=b.id
            LEFT JOIN students s
                ON bi.student_id=s.id
            WHERE DATE(bi.issue_date)=CURDATE()
            ORDER BY bi.issue_date DESC
        `;

        const [rows] = await db.query(sql);

        return rows;

    },

    // ======================================
    // Today's Returns
    // ======================================

    async getTodayReturns() {

        const sql = `
            SELECT
                bi.*,
                b.title,
                s.full_name
            FROM book_issues bi
            LEFT JOIN books b
                ON bi.book_id=b.id
            LEFT JOIN students s
                ON bi.student_id=s.id
            WHERE DATE(bi.return_date)=CURDATE()
            ORDER BY bi.return_date DESC
        `;

        const [rows] = await db.query(sql);

        return rows;

    },

    // ======================================
    // Monthly Issue Report
    // ======================================

    async getMonthlyIssueReport() {

        const sql = `
            SELECT
                MONTH(issue_date) AS month,
                YEAR(issue_date) AS year,
                COUNT(*) AS total_issues
            FROM book_issues
            GROUP BY YEAR(issue_date),MONTH(issue_date)
            ORDER BY year DESC,month DESC
        `;

        const [rows] = await db.query(sql);

        return rows;

    },

    // ======================================
    // Monthly Return Report
    // ======================================

    async getMonthlyReturnReport() {

        const sql = `
            SELECT
                MONTH(return_date) AS month,
                YEAR(return_date) AS year,
                COUNT(*) AS total_returns
            FROM book_issues
            WHERE return_date IS NOT NULL
            GROUP BY YEAR(return_date),MONTH(return_date)
            ORDER BY year DESC,month DESC
        `;

        const [rows] = await db.query(sql);

        return rows;

    }

};

module.exports = LibraryDashboard;
