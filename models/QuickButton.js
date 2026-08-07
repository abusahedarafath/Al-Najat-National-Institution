const db = require("../config/database");

class QuickButton {

    static async getAll() {

        const [rows] = await db.query(

            `SELECT *
             FROM website_quick_buttons
             ORDER BY display_order ASC`

        );

        return rows;

    }

    static async getActive() {

        const [rows] = await db.query(

            `SELECT *
             FROM website_quick_buttons
             WHERE status='Active'
             ORDER BY display_order ASC`

        );

        return rows;

    }

    static async getById(id) {

        const [rows] = await db.query(

            "SELECT * FROM website_quick_buttons WHERE id=?",

            [id]

        );

        return rows[0];

    }

    static async create(data) {

        await db.query(

            `INSERT INTO website_quick_buttons

            (
                title,
                subtitle,
                icon,
                url,
                button_color,
                display_order,
                status
            )

            VALUES (?,?,?,?,?,?,?)`,

            [

                data.title,

                data.subtitle,

                data.icon,

                data.url,

                data.button_color,

                data.display_order,

                data.status

            ]

        );

    }

    static async update(id,data){

        await db.query(

            `UPDATE website_quick_buttons

            SET

            title=?,

            subtitle=?,

            icon=?,

            url=?,

            button_color=?,

            display_order=?,

            status=?

            WHERE id=?`,

            [

                data.title,

                data.subtitle,

                data.icon,

                data.url,

                data.button_color,

                data.display_order,

                data.status,

                id

            ]

        );

    }

    static async delete(id){

        await db.query(

            "DELETE FROM website_quick_buttons WHERE id=?",

            [id]

        );

    }

}

module.exports = QuickButton;
