const db = require("../config/database");
const path = require("path");

const DESIGNS = {
    carousel: "Circular Portrait Carousel",
    compact_grid: "Expandable Member Grid",
    profile_cards: "Premium Profile Cards",
    hierarchy: "Organisational Hierarchy"
};

exports.settingsPage = async (req, res) => {
    try {
        const [[settings]] = await db.query(
            `SELECT * FROM arsp_homepage_member_display_settings WHERE id = 1`
        );

        const [members] = await db.query(`
            SELECT
                m.id,
                m.full_name,
                m.photo,
                p.section,
                p.designation,
                p.display_order AS appointment_order,
                COALESCE(v.is_visible, 1) AS is_visible,
                v.display_order AS custom_order
            FROM arsp_management_positions p
            INNER JOIN arsp_members m ON m.id = p.member_id
            LEFT JOIN arsp_homepage_member_visibility v
                ON v.member_id = m.id
            WHERE p.status = 'Active'
              AND m.status = 'Active'
            ORDER BY
                COALESCE(v.display_order, p.display_order, 999999) ASC,
                p.display_order ASC,
                m.full_name ASC
        `);

        const preparedMembers = members.map(member => ({
            ...member,
            photo: member.photo ? path.basename(member.photo) : null,
            display_order: member.custom_order ?? member.appointment_order ?? 1
        }));

        res.render("admin/arsp/members-display-settings", {
            title: "ARSP Members Display Settings",
            settings: settings || {
                is_enabled: 1,
                design_key: "carousel"
            },
            designs: DESIGNS,
            members: preparedMembers
        });
    } catch (err) {
        console.error("ARSP Members Display Settings Error:", err);
        req.flash("error", "Unable to load Members Display Settings.");
        res.redirect("/admin/arsp");
    }
};

exports.saveSettings = async (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    let connection;

    try {
        console.log("ARSP DISPLAY POST DIAGNOSTIC:", {
            bodyExists: Boolean(req.body),
            contentType: req.headers["content-type"] || null,
            bodyKeys: Object.keys(body),
            designKey: body.design_key || null
        });

        const designKey = String(body.design_key || "").trim();

        if (!Object.prototype.hasOwnProperty.call(DESIGNS, designKey)) {
            req.flash("error", "Please select a valid display design.");
            return res.redirect("/admin/arsp/members-display-settings");
        }

        connection = await db.getConnection();

        const isEnabled = body.is_enabled === "on" ? 1 : 0;

        await connection.beginTransaction();

        await connection.query(`
            INSERT INTO arsp_homepage_member_display_settings
                (id, is_enabled, design_key)
            VALUES (1, ?, ?)
            ON DUPLICATE KEY UPDATE
                is_enabled = VALUES(is_enabled),
                design_key = VALUES(design_key)
        `, [isEnabled, designKey]);

        const [assignedMembers] = await connection.query(`
            SELECT DISTINCT m.id
            FROM arsp_management_positions p
            INNER JOIN arsp_members m ON m.id = p.member_id
            WHERE p.status = 'Active'
              AND m.status = 'Active'
        `);

        for (const member of assignedMembers) {
            const id = Number(member.id);
            const visible = body[`visible_${id}`] === "on" ? 1 : 0;

            const rawOrder = body[`order_${id}`];
            const parsedOrder = Number.parseInt(rawOrder, 10);
            const displayOrder =
                Number.isSafeInteger(parsedOrder) && parsedOrder > 0
                    ? parsedOrder
                    : 999999;

            await connection.query(`
                INSERT INTO arsp_homepage_member_visibility
                    (member_id, is_visible, display_order)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    is_visible = VALUES(is_visible),
                    display_order = VALUES(display_order)
            `, [id, visible, displayOrder]);
        }

        await connection.commit();

        req.flash("success", "Homepage Members Display Settings saved successfully.");
        return res.redirect("/admin/arsp/members-display-settings");
    } catch (err) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("ARSP Members Display Rollback Error:", rollbackError.message);
            }
        }

        console.error("ARSP Members Display Save Error:", err);
        req.flash("error", "Unable to save Members Display Settings.");
        return res.redirect("/admin/arsp/members-display-settings");
    } finally {
        if (connection) connection.release();
    }
};
