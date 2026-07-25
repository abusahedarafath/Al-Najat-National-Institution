const db = require("../config/database");

class News {

    static getAll(callback) {

        const sql = `
            SELECT *
            FROM news
            ORDER BY publish_date DESC, id DESC
        `;

        db.query(sql, callback);

    }

    static getActive(callback) {

        const sql = `
            SELECT *
            FROM news
            WHERE status='Active'
            ORDER BY publish_date DESC, id DESC
        `;

        db.query(sql, callback);

    }

    static getLatest(limit, callback) {

        const sql = `
            SELECT *
            FROM news
            WHERE status='Active'
            ORDER BY publish_date DESC, id DESC
            LIMIT ?
        `;

        db.query(sql, [Number(limit)], callback);

    }

    static getById(id, callback) {

        db.query(
            "SELECT * FROM news WHERE id=?",
            [id],
            callback
        );

    }

    static create(data, callback) {

        const sql = `
            INSERT INTO news
            (
                title,
                description,
                image,
                publish_date,
                status
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                data.title,
                data.description,
                data.image,
                data.publish_date,
                data.status
            ],
            callback
        );

    }

    static update(id, data, callback) {

        const sql = `
            UPDATE news
            SET
                title=?,
                description=?,
                image=?,
                publish_date=?,
                status=?
            WHERE id=?
        `;

        db.query(
            sql,
            [
                data.title,
                data.description,
                data.image,
                data.publish_date,
                data.status,
                id
            ],
            callback
        );

    }

    static delete(id, callback) {

        db.query(
            "DELETE FROM news WHERE id=?",
            [id],
            callback
        );

    }

}

module.exports = News;
