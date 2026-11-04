const db = require("../config/database");
const path = require("path");

class ArspHomepageDisplay {
    static async getSettings() {
        const [rows] = await db.query(`
            SELECT is_enabled, design_key
            FROM arsp_homepage_member_display_settings
            WHERE id = 1
            LIMIT 1
        `);

        return rows[0] || {
            is_enabled: 1,
            design_key: "carousel"
        };
    }

    static async getVisibleMembers() {
        const [rows] = await db.query(`
            SELECT
                m.id,
                m.full_name,
                m.photo,
                p.section,
                p.designation,
                p.display_order AS appointment_order,
                COALESCE(v.display_order, p.display_order, 999999) AS homepage_order
            FROM arsp_management_positions p
            INNER JOIN arsp_members m
                ON m.id = p.member_id
            LEFT JOIN arsp_homepage_member_visibility v
                ON v.member_id = m.id
            WHERE p.status = 'Active'
              AND m.status = 'Active'
              AND COALESCE(v.is_visible, 1) = 1
            ORDER BY
                COALESCE(v.display_order, p.display_order, 999999) ASC,
                p.display_order ASC,
                p.id ASC
        `);

        return rows.map(member => ({
            ...member,
            photo: member.photo ? path.basename(member.photo) : null
        }));
    }
}

module.exports = ArspHomepageDisplay;
