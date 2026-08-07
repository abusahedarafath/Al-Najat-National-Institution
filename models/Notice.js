const db = require("../config/database");

class Notice {

    static async getAll() {
        const sql = `
            SELECT *
            FROM notices
            ORDER BY publish_date DESC, id DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    static async getActive() {
        const sql = `
            SELECT *
            FROM notices
            WHERE status='Active'
            ORDER BY publish_date DESC, id DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    static async getLatest(limit) {
        const sql = `
            SELECT *
            FROM notices
            WHERE status='Active'
            ORDER BY publish_date DESC, id DESC
            LIMIT ?
        `;
        const [rows] = await db.query(sql, [Number(limit)]);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM notices WHERE id = ?",
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const sql = `
            INSERT INTO notices
            (title, description, file, publish_date, status)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            data.title,
            data.description,
            data.file,
            data.publish_date,
            data.status
        ]);

        return result;
    }

    static async update(id, data) {
        const sql = `
            UPDATE notices
            SET
                title = ?,
                description = ?,
                file = ?,
                publish_date = ?,
                status = ?
            WHERE id = ?
        `;

        const [result] = await db.query(sql, [
            data.title,
            data.description,
            data.file,
            data.publish_date,
            data.status,
            id
        ]);

        return result;
    }

    static async delete(id) {
        const [result] = await db.query(
            "DELETE FROM notices WHERE id = ?",
            [id]
        );

        return result;
    }
}

module.exports = Notice;
