const db = require("../config/database");

const TransportRoute = {

    // ======================================
    // Get All Routes
    // ======================================

    async getAll() {

        const [rows] = await db.query(`
            SELECT *
            FROM transport_routes
            ORDER BY route_name ASC
        `);

        return rows;

    },

    // ======================================
    // Get Route By ID
    // ======================================

    async getById(id) {

        const [rows] = await db.query(
            "SELECT * FROM transport_routes WHERE id = ?",
            [id]
        );

        return rows[0];

    },


// ======================================
// Create Route
// ======================================

async create(data) {

    const [result] = await db.query(
        `
        INSERT INTO transport_routes
        (
            route_code,
            route_name,
            start_point,
            end_point,
            distance,
            estimated_time,
            fare,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.route_code,
            data.route_name,
            data.start_point,
            data.end_point,
            data.distance,
            data.estimated_time,
            data.fare,
            data.status
        ]
    );

    return result;

},




// ======================================
// Update Route
// ======================================

async update(id, data) {

    const [result] = await db.query(
        `
        UPDATE transport_routes
        SET
            route_code = ?,
            route_name = ?,
            start_point = ?,
            end_point = ?,
            distance = ?,
            estimated_time = ?,
            fare = ?,
            status = ?
        WHERE id = ?
        `,
        [
            data.route_code,
            data.route_name,
            data.start_point,
            data.end_point,
            data.distance,
            data.estimated_time,
            data.fare,
            data.status,
            id
        ]
    );

    return result;

},

    // ======================================
    // Delete Route
    // ======================================

    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM transport_routes WHERE id=?",
            [id]
        );

        return result;

    },

    // ======================================
    // Active Routes
    // ======================================

    async getActive() {

        const [rows] = await db.query(`
            SELECT *
            FROM transport_routes
            WHERE status='Active'
            ORDER BY route_name ASC
        `);

        return rows;

    }

};

module.exports = TransportRoute;
