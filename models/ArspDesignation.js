const db = require("../config/database");

class ArspDesignation {

    // ==========================
    // Get All Designations
    // ==========================

    static async getAll() {

        const [rows] = await db.query(

            `SELECT *
             FROM arsp_designations
             ORDER BY section, display_order ASC`

        );

        return rows;

    }

    // ==========================
    // Get Active Designations
    // ==========================

    static async getActive() {

        const [rows] = await db.query(

            `SELECT *
             FROM arsp_designations
             WHERE status='Active'
             ORDER BY section, display_order ASC`

        );

        return rows;

    }

    // ==========================
    // Get By Section
    // ==========================

    static async getBySection(section) {

        const [rows] = await db.query(

            `SELECT *
             FROM arsp_designations
             WHERE section=?
             ORDER BY display_order ASC`,

            [section]

        );

        return rows;

    }

    // ==========================
    // Get Active By Section
    // ==========================

    static async getActiveBySection(section) {

        const [rows] = await db.query(

            `SELECT *
             FROM arsp_designations
             WHERE section=?
             AND status='Active'
             ORDER BY display_order ASC`,

            [section]

        );

        return rows;

    }

}

module.exports = ArspDesignation;
