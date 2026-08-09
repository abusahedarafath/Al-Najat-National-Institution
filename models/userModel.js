const db = require("../config/database");
const bcrypt = require("bcryptjs");

const User = {

    // =====================================
    // Create User
    // =====================================
    async create(user) {

        const hash = await bcrypt.hash(user.password, 10);

        const sql = `
            INSERT INTO users
            (
                username,
                password,
                role,
                reference_id,
                status
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            user.username,
            hash,
            user.role,
            user.reference_id,
            "Active"
        ]);

        return result;
    },


    // =====================================
    // Find User By Username
    // =====================================
    async findByUsername(username) {

        const sql = `
            SELECT *
            FROM users
            WHERE username = ?
            LIMIT 1
        `;

        const [rows] = await db.query(sql, [username]);

        return rows[0] || null;
    },


    // =====================================
    // Find User By ID
    // =====================================
    async findById(id) {

        const sql = `
            SELECT *
            FROM users
            WHERE id = ?
            LIMIT 1
        `;

        const [rows] = await db.query(sql, [id]);

        return rows[0] || null;
    },


    // =====================================
    // Get Active Admin
    // =====================================
    async getActiveAdmin() {

        const sql = `
            SELECT *
            FROM users
            WHERE role = 'admin'
              AND status = 'Active'
            ORDER BY id ASC
            LIMIT 1
        `;

        const [rows] = await db.query(sql);

        return rows[0] || null;
    },


    // =====================================
    // Change Admin Credentials
    // =====================================
    async replaceAdminCredentials(
        oldAdminId,
        newUsername,
        newPassword
    ) {

        const connection = await db.getConnection();

        try {

            await connection.beginTransaction();

            // ---------------------------------
            // Lock current active admin
            // ---------------------------------
            const [admins] = await connection.query(
                `
                SELECT *
                FROM users
                WHERE role = 'admin'
                  AND status = 'Active'
                ORDER BY id ASC
                LIMIT 1
                FOR UPDATE
                `
            );

            if (!admins.length) {
                throw new Error("No active administrator account found.");
            }

            const oldAdmin = admins[0];

            // Safety check
            if (oldAdmin.id !== oldAdminId) {
                throw new Error("Administrator account changed during recovery.");
            }

            // ---------------------------------
            // Check username availability
            // ---------------------------------
            const [existing] = await connection.query(
                `
                SELECT id
                FROM users
                WHERE username = ?
                LIMIT 1
                `,
                [newUsername]
            );

            if (existing.length) {
                throw new Error("The new Admin ID is already in use.");
            }

            // ---------------------------------
            // Hash new password
            // ---------------------------------
            const passwordHash = await bcrypt.hash(
                newPassword,
                12
            );

            // ---------------------------------
            // Deactivate OLD admin
            // ---------------------------------
            await connection.query(
                `
                UPDATE users
                SET status = 'Inactive'
                WHERE id = ?
                  AND role = 'admin'
                `,
                [oldAdmin.id]
            );

            // ---------------------------------
            // Create NEW admin
            // ---------------------------------
            await connection.query(
                `
                INSERT INTO users
                (
                    username,
                    password,
                    role,
                    reference_id,
                    status
                )
                VALUES (?, ?, 'admin', ?, 'Active')
                `,
                [
                    newUsername,
                    passwordHash,
                    oldAdmin.reference_id
                ]
            );

            await connection.commit();

            return {
                oldAdminId: oldAdmin.id,
                oldUsername: oldAdmin.username,
                newUsername
            };

        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();

        }
    }

};

module.exports = User;
