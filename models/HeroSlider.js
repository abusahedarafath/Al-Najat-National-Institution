const db = require("../config/database");

class HeroSlider {

    // Get All Sliders
    static async getAll() {
        const sql = `
            SELECT *
            FROM hero_sliders
            ORDER BY display_order ASC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    // Get Active Sliders
    static async getActive() {
        const sql = `
            SELECT *
            FROM hero_sliders
            WHERE status='Active'
            ORDER BY display_order ASC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    // Get Slider By ID
    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM hero_sliders WHERE id=?",
            [id]
        );
        return rows[0] || null;
    }

    // Create Slider
    static async create(data) {

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

        const [result] = await db.query(sql, [
            data.title,
            data.subtitle,
            data.button_text,
            data.button_link,
            data.image,
            data.display_order,
            data.status
        ]);

        return result;
    }

    // Update Slider
    static async update(id, data) {

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

        const [result] = await db.query(sql, [
            data.title,
            data.subtitle,
            data.button_text,
            data.button_link,
            data.image,
            data.display_order,
            data.status,
            id
        ]);

        return result;
    }

    // Delete Slider
    static async delete(id) {
        const [result] = await db.query(
            "DELETE FROM hero_sliders WHERE id=?",
            [id]
        );
        return result;
    }

    // Toggle Status
    static async toggleStatus(id, status) {
        const [result] = await db.query(
            "UPDATE hero_sliders SET status=? WHERE id=?",
            [status, id]
        );
        return result;
    }

}

module.exports = HeroSlider;
