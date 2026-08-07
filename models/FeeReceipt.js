const db = require("../config/database");

const FeeReceipt = {

    // ======================================
    // Get Receipt by Receipt Number
    // ======================================

    getByReceiptNo(receiptNo, callback) {

        const sql = `
            SELECT
                fp.*,
                s.name AS student_name,
                s.roll_number,
                s.father_name,
                s.mobile,
                c.class_name,
                fc.category_name
            FROM fee_payments fp
            LEFT JOIN students s
                ON fp.student_id = s.id
            LEFT JOIN classes c
                ON fp.class_id = c.id
            LEFT JOIN fee_categories fc
                ON fp.category_id = fc.id
            WHERE fp.receipt_no = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [receiptNo],
            callback
        );

    },

    // ======================================
    // Get Receipt by Payment ID
    // ======================================

    getByPaymentId(paymentId, callback) {

        const sql = `
            SELECT
                fp.*,
                s.name AS student_name,
                s.roll_number,
                s.father_name,
                s.mobile,
                c.class_name,
                fc.category_name
            FROM fee_payments fp
            LEFT JOIN students s
                ON fp.student_id = s.id
            LEFT JOIN classes c
                ON fp.class_id = c.id
            LEFT JOIN fee_categories fc
                ON fp.category_id = fc.id
            WHERE fp.id = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [paymentId],
            callback
        );

    },

    // ======================================
    // Receipt Summary
    // ======================================

    getReceiptSummary(paymentId, callback) {

        const sql = `
            SELECT
                receipt_no,
                payment_date,
                payment_method,
                amount,
                fine,
                discount,
                (
                    amount +
                    fine -
                    discount
                ) AS total_amount
            FROM fee_payments
            WHERE id = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [paymentId],
            callback
        );

    }

};

module.exports = FeeReceipt;
