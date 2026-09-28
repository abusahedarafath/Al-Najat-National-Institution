"use strict";

const db = require("../config/database");

class RtsePyqCategory {
    static async getAll(includeInactive = true) {
        const sql = includeInactive
            ? `SELECT * FROM rtse_pyq_categories
               ORDER BY display_order ASC, year DESC, id DESC`
            : `SELECT * FROM rtse_pyq_categories
               WHERE is_active = 1
               ORDER BY display_order ASC, year DESC, id DESC`;

        const [rows] = await db.query(sql);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            `SELECT * FROM rtse_pyq_categories
             WHERE id=?
             LIMIT 1`,
            [id]
        );

        return rows[0] || null;
    }

    static async getByYear(year) {
        const [rows] = await db.query(
            `SELECT * FROM rtse_pyq_categories
             WHERE year=?
             LIMIT 1`,
            [year]
        );

        return rows[0] || null;
    }

    static async create(data) {
        const [result] = await db.query(
            `INSERT INTO rtse_pyq_categories
             (year, title, display_order, is_active)
             VALUES (?, ?, ?, ?)`,
            [
                data.year,
                data.title,
                data.display_order,
                data.is_active
            ]
        );

        return this.getById(result.insertId);
    }

    static async update(id, data) {
        await db.query(
            `UPDATE rtse_pyq_categories
             SET year=?, title=?, display_order=?, is_active=?
             WHERE id=?`,
            [
                data.year,
                data.title,
                data.display_order,
                data.is_active,
                id
            ]
        );

        return this.getById(id);
    }

    static async toggle(id) {
        await db.query(
            `UPDATE rtse_pyq_categories
             SET is_active = IF(is_active=1, 0, 1)
             WHERE id=?`,
            [id]
        );

        return this.getById(id);
    }

    static async delete(id) {
        await db.query(
            `DELETE FROM rtse_pyq_categories
             WHERE id=?`,
            [id]
        );
    }
}

module.exports = RtsePyqCategory;
