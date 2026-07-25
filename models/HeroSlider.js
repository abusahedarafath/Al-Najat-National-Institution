const db = require("../config/database");

class HeroSlider {

    // ==========================
    // Get All Sliders
    // ==========================
    static getAll(callback) {
        const sql = `
            SELECT *
            FROM hero_sliders
            ORDER BY display_order ASC
        `;
        db.query(sql, callback);
    }

    // ==========================
    // Get Active Sliders
    // ==========================
    static getActive(callback) {
        const sql = `
            SELECT *
            FROM hero_sliders
            WHERE status='Active'
            ORDER BY display_order ASC
        `;
        db.query(sql, callback);
    }

    // ==========================
    // Get Slider By ID
    // ==========================
    static getById(id, callback) {
        db.query(
            "SELECT * FROM hero_sliders WHERE id=?",
            [id],
            callback
        );
    }

    // ==========================
    // Create Slider
    // ==========================
    static create(data, callback) {

        const sql = `
            INSERT INTO hero_sliders
            (
                title,
                subtitle,
                button_text,
                button_link,
                image,
                display_order,
                status
            )
            VALUES (?,?,?,?,?,?,?)
        `;

        db.query(sql, [
            data.title,
            data.subtitle,
            data.button_text,
            data.button_link,
            data.image,
            data.display_order,
            data.status
        ], callback);

    }

    // ==========================
    // Update Slider
    // ==========================
    static update(id, data, callback) {

        const sql = `
            UPDATE hero_sliders
            SET
                title=?,
                subtitle=?,
                button_text=?,
                button_link=?,
                image=?,
                display_order=?,
                status=?
            WHERE id=?
        `;

        db.query(sql, [
            data.title,
            data.subtitle,
            data.button_text,
            data.button_link,
            data.image,
            data.display_order,
            data.status,
            id
        ], callback);

    }

    // ==========================
    // Delete Slider
    // ==========================
    static delete(id, callback) {

        db.query(
            "DELETE FROM hero_sliders WHERE id=?",
            [id],
            callback
        );

    }

    // ==========================
    // Toggle Status
    // ==========================
    static toggleStatus(id, status, callback) {

        db.query(
            "UPDATE hero_sliders SET status=? WHERE id=?",
            [status, id],
            callback
        );

    }

}

module.exports = HeroSlider;
