const db = require("../config/database");

const FeePayment = {

    // ==============================
    // Get All Payments
    // ==============================

    async getAll() {

        const [rows] = await db.query(`
            SELECT
                fp.*,
                s.full_name AS student_name,
                s.student_id,
                c.class_name,
                fc.category_name
            FROM fee_payments fp
            LEFT JOIN students s
                ON fp.student_id = s.id
            LEFT JOIN classes c
                ON fp.class_id = c.id
            LEFT JOIN fee_categories fc
                ON fp.fee_category_id = fc.id
            ORDER BY fp.id DESC
        `);

        return rows;

    },

    // ==============================
    // Get Payment By ID
    // ==============================

    async getById(id) {

        const [rows] = await db.query(
            `
            SELECT *
            FROM fee_payments
            WHERE id=?
            `,
            [id]
        );

        return rows[0] || null;

    },

    // ==============================
    // Create Payment
    // ==============================

    async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO fee_payments
            (
                receipt_no,
                student_id,
                class_id,
                fee_category_id,
                amount,
                fine,
                discount,
                payment_method,
                payment_status,
                transaction_id,
                payment_date,
                remarks
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.receipt_no,
                data.student_id,
                data.class_id,
                data.fee_category_id,
                data.amount,
                data.fine || 0,
                data.discount || 0,
                data.payment_method,
                data.payment_status,
                data.transaction_id || null,
                data.payment_date,
                data.remarks || null
            ]
        );

        return result;

    },

    // ==============================
    // Update Payment
    // ==============================

    async update(id, data) {

        const [result] = await db.query(
            `
            UPDATE fee_payments
            SET
                student_id=?,
                class_id=?,
                fee_category_id=?,
                amount=?,
                fine=?,
                discount=?,
                payment_method=?,
                payment_status=?,
                transaction_id=?,
                payment_date=?,
                remarks=?
            WHERE id=?
            `,
            [
                data.student_id,
                data.class_id,
                data.fee_category_id,
                data.amount,
                data.fine || 0,
                data.discount || 0,
                data.payment_method,
                data.payment_status,
                data.transaction_id || null,
                data.payment_date,
                data.remarks || null,
                id
            ]
        );

        return result;

    },

    // ==============================
    // Delete Payment
    // ==============================

    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM fee_payments WHERE id=?",
            [id]
        );

        return result;

    },

    // ==============================
    // Generate Receipt Number
    // ==============================

    async generateReceiptNo() {

        const year = new Date().getFullYear();

        const [rows] = await db.query(
            `
            SELECT receipt_no
            FROM fee_payments
            WHERE receipt_no LIKE ?
            ORDER BY id DESC
            LIMIT 1
            `,
            [`ALN-${year}-%`]
        );

        let next = 1;

        if (rows.length > 0) {

            const lastReceipt = rows[0].receipt_no;
            const lastNumber = parseInt(lastReceipt.split("-").pop());

            if (!isNaN(lastNumber)) {
                next = lastNumber + 1;
            }

        }

        return `ALN-${year}-${String(next).padStart(6, "0")}`;

    }

};

module.exports = FeePayment;
