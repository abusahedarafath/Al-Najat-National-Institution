const db = require("../config/database");

const Class = {

    // ======================================
    // Get All Classes
    // ======================================

    async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM classes
            ORDER BY sort_order ASC, class_name ASC
        `);

        return rows;

    },

    // ======================================
    // Get Class By ID
    // ======================================

    async getById(id) {

        const [rows] = await db.query(
            `
            SELECT *
            FROM classes
            WHERE id = ?
            `,
            [id]
        );

        return rows[0] || null;

    },

    // ======================================
    // Create Class
    // ======================================

    async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO classes
            (
                class_name,
                class_code,
                section,
                academic_session,
                class_teacher,
                capacity,
                sort_order,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.class_name,
                data.class_code,
                data.section,
                data.academic_session,
                data.class_teacher || null,
                data.capacity || 0,
                data.sort_order || 0,
                data.status || "Active"
            ]
        );

        return result;

    },

    // ======================================
    // Update Class
    // ======================================

    async update(id, data) {

        const [result] = await db.query(
            `
            UPDATE classes
            SET
                class_name = ?,
                class_code = ?,
                section = ?,
                academic_session = ?,
                class_teacher = ?,
                capacity = ?,
                sort_order = ?,
                status = ?
            WHERE id = ?
            `,
            [
                data.class_name,
                data.class_code,
                data.section,
                data.academic_session,
                data.class_teacher || null,
                data.capacity || 0,
                data.sort_order || 0,
                data.status,
                id
            ]
        );

        return result;

    },

    // ======================================
    // Delete Class
    // ======================================

    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM classes WHERE id = ?",
            [id]
        );

        return result;

    },

    // ======================================
    // Get Active Classes
    // ======================================

    async getActive() {

        const [rows] = await db.query(`
            SELECT *
            FROM classes
            WHERE status = 'Active'
            ORDER BY sort_order ASC, class_name ASC
        `);

        return rows;

    }

};

module.exports = Class;
