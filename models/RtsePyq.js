"use strict";

const db = require("../config/database");

class RtsePyq {
    static async getAll(includeInactive = true) {
        const sql = includeInactive
            ? `SELECT * FROM rtse_pyqs ORDER BY display_order ASC, year DESC, id DESC`
            : `SELECT * FROM rtse_pyqs
               WHERE is_active = 1
               ORDER BY display_order ASC, year DESC, id DESC`;

        const [rows] = await db.query(sql);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            `SELECT * FROM rtse_pyqs WHERE id=? LIMIT 1`,
            [id]
        );
        return rows[0] || null;
    }

    static async create(data) {
        const [result] = await db.query(
            `INSERT INTO rtse_pyqs
             (year, class_name, pdf_path, display_order, is_active)
             VALUES (?, ?, ?, ?, ?)`,
            [
                data.year,
                data.class_name,
                data.pdf_path,
                data.display_order,
                data.is_active
            ]
        );

        return this.getById(result.insertId);
    }

    static async update(id, data) {
        await db.query(
            `UPDATE rtse_pyqs
             SET year=?, class_name=?, pdf_path=?, display_order=?, is_active=?
             WHERE id=?`,
            [
                data.year,
                data.class_name,
                data.pdf_path,
                data.display_order,
                data.is_active,
                id
            ]
        );

        return this.getById(id);
    }

    static async delete(id) {
        await db.query(
            `DELETE FROM rtse_pyqs WHERE id=?`,
            [id]
        );
    }

    static async toggle(id) {
        await db.query(
            `UPDATE rtse_pyqs
             SET is_active = IF(is_active=1, 0, 1)
             WHERE id=?`,
            [id]
        );

        return this.getById(id);
    }
}

module.exports = RtsePyq;
