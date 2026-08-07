const db = require("../config/database");

const FeeCategory = {

    // ======================================
    // Get All Fee Categories
    // ======================================
    async getAll() {
        const [rows] = await db.query(`
            SELECT *
            FROM fee_categories
            ORDER BY category_name ASC
        `);
        return rows;
    },

    // ======================================
    // Get Fee Category By ID
    // ======================================
    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM fee_categories WHERE id = ?",
            [id]
        );
        return rows;
    },

    // ======================================
    // Create Fee Category
    // ======================================
    async create(data) {
        const [result] = await db.query(
            `INSERT INTO fee_categories
            (category_name, amount, description, status)
            VALUES (?, ?, ?, ?)`,
            [
                data.category_name,
                data.amount,
                data.description,
                data.status
            ]
        );

        return result;
    },

    // ======================================
    // Update Fee Category
    // ======================================
    async update(id, data) {
        const [result] = await db.query(
            `UPDATE fee_categories
            SET
                category_name = ?,
                amount = ?,
                description = ?,
                status = ?
            WHERE id = ?`,
            [
                data.category_name,
                data.amount,
                data.description,
                data.status,
                id
            ]
        );

        return result;
    },

    // ======================================
    // Delete Fee Category
    // ======================================
    async delete(id) {
        const [result] = await db.query(
            "DELETE FROM fee_categories WHERE id = ?",
            [id]
        );

        return result;
    },

    // ======================================
    // Get Active Fee Categories
    // ======================================
    async getActive() {
        const [rows] = await db.query(
            `SELECT *
             FROM fee_categories
             WHERE status = 'Active'
             ORDER BY category_name ASC`
        );

        return rows;
    }

};

module.exports = FeeCategory;
