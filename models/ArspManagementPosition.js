const db = require("../config/database");

class ArspManagementPosition {

    // ==========================
    // Assign Position
    // ==========================

    static async assign(data) {

    const sql = `
        INSERT INTO arsp_management_positions
        (
            member_id,
            committee_id,
            section,
            designation,
            region_id,
            display_order,
            appointed_at,
            status
        )
        VALUES (?,?,?,?,?,?,?,?)
    `;

    const [result] = await db.query(sql, [

        data.member_id,
        data.committee_id,
        data.section,
        data.designation,
        data.region_id || null,
        data.display_order,
        data.appointed_at,
        data.status

    ]);

    return result;

}

    // ==========================
    // Update Position
    // ==========================

    static async update(id, data) {

        const sql = `
            UPDATE arsp_management_positions
            SET
                section=?,
                designation=?,
                display_order=?,
                appointed_at=?,
                status=?
            WHERE id=?
        `;

        const [result] = await db.query(sql, [

            data.section,
            data.designation,
            data.display_order,
            data.appointed_at,
            data.status,
            id

        ]);

        return result;

    }

    // ==========================
    // Delete Assignment
    // ==========================

    static async delete(id) {

        const [result] = await db.query(

            "DELETE FROM arsp_management_positions WHERE id=?",

            [id]

        );

        return result;

    }

// ==========================
// Remove Assignment
// ==========================

static async remove(memberId) {

    const [result] = await db.query(

        `UPDATE arsp_management_positions
         SET status='Inactive'
         WHERE member_id=?
         AND status='Active'`,

        [memberId]

    );

    return result;

}


    // ==========================
    // Get Founder
    // ==========================

    static async getFounder() {

        const [rows] = await db.query(`

            SELECT
                p.*,
                m.*

            FROM arsp_management_positions p

            JOIN arsp_members m

            ON p.member_id=m.id

            WHERE
                p.section='Founder'
            AND
                p.status='Active'

            ORDER BY
                p.display_order ASC

        `);

        return rows;

    }

    // ==========================
    // Organizing Body
    // ==========================

    static async getOrganizingBody() {

        const [rows] = await db.query(`

            SELECT
                p.*,
                m.*

            FROM arsp_management_positions p

            JOIN arsp_members m

            ON p.member_id=m.id

            WHERE
                p.section='Organizing Body'
            AND
                p.status='Active'

            ORDER BY
                p.display_order ASC

        `);

        return rows;

    }

    // ==========================
    // Chief Adviser
    // ==========================

    static async getChiefAdviser() {

    const [rows] = await db.query(`

        SELECT
            p.*,
            m.*

        FROM arsp_management_positions p

        JOIN arsp_members m

        ON p.member_id = m.id

        WHERE
            p.section='Chief Adviser'
        AND
            p.status='Active'

        ORDER BY
            p.display_order ASC

    `);

   return rows[0] || null;
}

    // ==========================
    // Advisory Body
    // ==========================

    static async getAdvisoryBody() {

        const [rows] = await db.query(`

            SELECT
                p.*,
                m.*

            FROM arsp_management_positions p

            JOIN arsp_members m

            ON p.member_id=m.id

            WHERE
                p.section='Advisory Body'
            AND
                p.status='Active'

            ORDER BY
                p.display_order ASC

        `);

        return rows;






    }



// ==========================
// Get Active Position by Member
// ==========================

static async getByMemberId(memberId) {

    const [rows] = await db.query(

        `SELECT
            p.*,
            c.committee_name
         FROM arsp_management_positions p
         LEFT JOIN arsp_committees c
            ON p.committee_id = c.id
         WHERE
            p.member_id = ?
         AND
            p.status = 'Active'
         LIMIT 1`,

        [memberId]

    );

    return rows[0] || null;

}





// ==========================
// Dashboard Statistics
// ==========================

static async getDashboardCounts() {

    const [[founder]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM arsp_management_positions
        WHERE section='Founder'
        AND status='Active'
    `);

    const [[chief]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM arsp_management_positions
        WHERE section='Chief Adviser'
        AND status='Active'
    `);

    const [[organizing]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM arsp_management_positions
        WHERE section='Organizing Body'
        AND status='Active'
    `);

    const [[advisory]] = await db.query(`
        SELECT COUNT(*) AS total
        FROM arsp_management_positions
        WHERE section='Advisory Body'
        AND status='Active'
    `);

    return {
        founder: founder.total,
        chiefAdviser: chief.total,
        organizingBody: organizing.total,
        advisoryBody: advisory.total
    };

}






}






module.exports = ArspManagementPosition;
