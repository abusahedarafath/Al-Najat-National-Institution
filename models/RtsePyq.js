"use strict";

const db = require("../config/database");

class RtsePyq {
    static async getAll(includeInactive = true) {
        const sql = includeInactive
            ? `SELECT p.*, c.title AS category_title
               FROM rtse_pyqs p
               LEFT JOIN rtse_pyq_categories c ON c.id = p.category_id
               ORDER BY
                   COALESCE(c.display_order, 999999) ASC,
                   p.display_order ASC,
                   p.year DESC,
                   p.id DESC`
            : `SELECT p.*, c.title AS category_title
               FROM rtse_pyqs p
               LEFT JOIN rtse_pyq_categories c ON c.id = p.category_id
               WHERE p.is_active = 1
                 AND (p.category_id IS NULL OR c.is_active = 1)
               ORDER BY
                   COALESCE(c.display_order, 999999) ASC,
                   p.display_order ASC,
                   p.year DESC,
                   p.id DESC`;

        const [rows] = await db.query(sql);
        return rows;
    }

    static async getByCategory(categoryId, includeInactive = true) {
        const sql = includeInactive
            ? `SELECT p.*, c.title AS category_title
               FROM rtse_pyqs p
               INNER JOIN rtse_pyq_categories c ON c.id = p.category_id
               WHERE p.category_id = ?
               ORDER BY p.display_order ASC, p.year DESC, p.id DESC`
            : `SELECT p.*, c.title AS category_title
               FROM rtse_pyqs p
               INNER JOIN rtse_pyq_categories c ON c.id = p.category_id
               WHERE p.category_id = ?
                 AND p.is_active = 1
                 AND c.is_active = 1
               ORDER BY p.display_order ASC, p.year DESC, p.id DESC`;

        const [rows] = await db.query(sql, [categoryId]);
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
             (category_id, year, class_name, pdf_path, display_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.category_id || null,
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
             SET category_id=?, year=?, class_name=?, pdf_path=?, display_order=?, is_active=?
             WHERE id=?`,
            [
                data.category_id || null,
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
