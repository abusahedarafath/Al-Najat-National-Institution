const db = require("../config/database");

const Vehicle = {

    // ======================================
    // Get All Vehicles
    // ======================================

    async getAll() {

        const [rows] = await db.query(`
            SELECT
                v.*,
                tr.route_name
            FROM vehicles v
            LEFT JOIN transport_routes tr
                ON v.route_id = tr.id
            ORDER BY v.vehicle_name ASC
        `);

        return rows;

    },

    // ======================================
    // Get Vehicle By ID
    // ======================================

    async getById(id) {

        const [rows] = await db.query(
            `
            SELECT
                v.*,
                tr.route_name
            FROM vehicles v
            LEFT JOIN transport_routes tr
                ON v.route_id = tr.id
            WHERE v.id = ?
            `,
            [id]
        );

        return rows[0];

    },

    // ======================================
    // Create Vehicle
    // ======================================

    async create(data) {

        const [result] = await db.query(
            `
            INSERT INTO vehicles
            (
                vehicle_name,
                vehicle_number,
                vehicle_type,
                capacity,
                route_id,
                driver_name,
                driver_mobile,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.vehicle_name,
                data.vehicle_number,
                data.vehicle_type,
                data.capacity,
                data.route_id,
                data.driver_name,
                data.driver_mobile,
                data.status
            ]
        );

        return result;

    },

    // ======================================
    // Update Vehicle
    // ======================================

    async update(id, data) {

        const [result] = await db.query(
            `
            UPDATE vehicles
            SET
                vehicle_name=?,
                vehicle_number=?,
                vehicle_type=?,
                capacity=?,
                route_id=?,
                driver_name=?,
                driver_mobile=?,
                status=?
            WHERE id=?
            `,
            [
                data.vehicle_name,
                data.vehicle_number,
                data.vehicle_type,
                data.capacity,
                data.route_id,
                data.driver_name,
                data.driver_mobile,
                data.status,
                id
            ]
        );

        return result;

    },

    // ======================================
    // Delete Vehicle
    // ======================================

    async delete(id) {

        const [result] = await db.query(
            "DELETE FROM vehicles WHERE id=?",
            [id]
        );

        return result;

    },

    // ======================================
    // Get Active Vehicles
    // ======================================

    async getActive() {

        const [rows] = await db.query(`
            SELECT *
            FROM vehicles
            WHERE status='Active'
            ORDER BY vehicle_name ASC
        `);

        return rows;

    }

};

module.exports = Vehicle;
