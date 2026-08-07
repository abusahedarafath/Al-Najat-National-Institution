const db = require("../config/database");

class News {

    static async getAll() {
        const sql = `
            SELECT *
            FROM news
            ORDER BY publish_date DESC, id DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    static async getActive() {
        const sql = `
            SELECT *
            FROM news
            WHERE status='Active'
            ORDER BY publish_date DESC, id DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    static async getLatest(limit) {
        const sql = `
            SELECT *
            FROM news
            WHERE status='Active'
            ORDER BY publish_date DESC, id DESC
            LIMIT ?
        `;
        const [rows] = await db.query(sql, [Number(limit)]);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM news WHERE id = ?",
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const sql = `
            INSERT INTO news
            (title, description, image, publish_date, status)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            data.title,
            data.description,
            data.image,
            data.publish_date,
            data.status
        ]);

        return result;
    }

    static async update(id, data) {
        const sql = `
            UPDATE news
            SET
                title = ?,
                description = ?,
                image = ?,
                publish_date = ?,
                status = ?
            WHERE id = ?
        `;

        const [result] = await db.query(sql, [
            data.title,
            data.description,
            data.image,
            data.publish_date,
            data.status,
            id
        ]);

        return result;
    }

    static async delete(id) {
        const [result] = await db.query(
            "DELETE FROM news WHERE id = ?",
            [id]
        );

        return result;
    }
}

module.exports = News;
