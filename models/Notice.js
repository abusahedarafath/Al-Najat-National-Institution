const db = require("../config/database");

class Notice {

    static getAll(callback) {
        const sql = `
            SELECT *
            FROM notices
            ORDER BY publish_date DESC, id DESC
        `;
        db.query(sql, callback);
    }

    static getActive(callback) {
        const sql = `
            SELECT *
            FROM notices
            WHERE status='Active'
            ORDER BY publish_date DESC, id DESC
        `;
        db.query(sql, callback);
    }

    static getLatest(limit, callback) {
        const sql = `
            SELECT *
            FROM notices
            WHERE status='Active'
            ORDER BY publish_date DESC, id DESC
            LIMIT ?
        `;
        db.query(sql, [Number(limit)], callback);
    }

    static getById(id, callback) {
        db.query(
            "SELECT * FROM notices WHERE id = ?",
            [id],
            callback
        );
    }

    static create(data, callback) {

        const sql = `
            INSERT INTO notices
            (title, description, file, publish_date, status)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                data.title,
                data.description,
                data.file,
                data.publish_date,
                data.status
            ],
            callback
        );
    }

    static update(id, data, callback) {

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

        db.query(
            sql,
            [
                data.title,
                data.description,
                data.file,
                data.publish_date,
                data.status,
                id
            ],
            callback
        );
    }

    static delete(id, callback) {
        db.query(
            "DELETE FROM notices WHERE id = ?",
            [id],
            callback
        );
    }

}

module.exports = Notice;
