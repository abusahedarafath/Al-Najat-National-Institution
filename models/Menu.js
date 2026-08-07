const db = require("../config/database");

class Menu {

    // ==========================
    // Get All Menus
    // ==========================

    static async getAll() {

        const [rows] = await db.query(

            `SELECT
                m.*,
                p.menu_title AS parent_name
             FROM website_menus m
             LEFT JOIN website_menus p
             ON m.parent_id=p.id
             ORDER BY
             m.display_order ASC,
             m.id ASC`

        );

        return rows;

    }

    // ==========================
    // Get Active Menus
    // ==========================

    static async getActive() {

        const [rows] = await db.query(

            `SELECT *
             FROM website_menus
             WHERE status='Active'
             ORDER BY
             display_order ASC,
             id ASC`

        );

        return rows;

    }

    // ==========================
    // Parent Menus
    // ==========================

    static async getParents() {

        const [rows] = await db.query(

            `SELECT *
             FROM website_menus
             WHERE parent_id IS NULL
             ORDER BY
             display_order ASC`

        );

        return rows;

    }

    // ==========================
    // Get By ID
    // ==========================

    static async getById(id) {

        const [rows] = await db.query(

            "SELECT * FROM website_menus WHERE id=?",

            [id]

        );

        return rows[0];

    }

    // ==========================
    // Create
    // ==========================

    static async create(data) {

        await db.query(

            `INSERT INTO website_menus

            (
                parent_id,
                menu_title,
                menu_url,
                menu_icon,
                target,
                display_order,
                status
            )

            VALUES (?,?,?,?,?,?,?)`,

            [

                data.parent_id || null,

                data.menu_title,

                data.menu_url,

                data.menu_icon,

                data.target,

                data.display_order,

                data.status

            ]

        );

    }

    // ==========================
    // Update
    // ==========================

    static async update(id,data){

        await db.query(

            `UPDATE website_menus

            SET

            parent_id=?,

            menu_title=?,

            menu_url=?,

            menu_icon=?,

            target=?,

            display_order=?,

            status=?

            WHERE id=?`,

            [

                data.parent_id || null,

                data.menu_title,

                data.menu_url,

                data.menu_icon,

                data.target,

                data.display_order,

                data.status,

                id

            ]

        );

    }

    // ==========================
    // Delete
    // ==========================

    static async delete(id){

        await db.query(

            "DELETE FROM website_menus WHERE id=?",

            [id]

        );

    }

}

module.exports = Menu;
