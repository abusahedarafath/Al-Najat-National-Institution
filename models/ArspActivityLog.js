const db = require("../config/database");

class ArspActivityLog {

    // ==========================
    // Add Activity
    // ==========================

    static async create(memberId, activity, ipAddress = null) {

        await db.query(

            `INSERT INTO arsp_activity_logs
            (member_id, activity, ip_address)
            VALUES (?, ?, ?)`,

            [

                memberId,

                activity,

                ipAddress

            ]

        );

    }

    // ==========================
    // Get Member Activities
    // ==========================

    static async getByMember(memberId) {

        const [rows] = await db.query(

            `SELECT *
             FROM arsp_activity_logs
             WHERE member_id=?
             ORDER BY created_at DESC
             LIMIT 50`,

            [

                memberId

            ]

        );

        return rows;

    }

}

module.exports = ArspActivityLog;
