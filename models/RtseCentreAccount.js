const db = require("../config/database");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class RtseCentreAccount {

    // =====================================
    // Generate Temporary Password
    // =====================================
    static generateTemporaryPassword() {
        return crypto.randomBytes(6).toString("base64url");
    }

    // =====================================
    // Find Account By Centre Login ID
    // Centre ID is the Portal Login ID
    // =====================================
    static async getByUsername(centreLoginId) {
        const [rows] = await db.query(
            `
            SELECT
                a.*,
                c.centre_id AS centre_public_id,
                c.centre_code,
                c.centre_name,
                c.centre_type,
                c.status AS centre_status
            FROM rtse_centre_accounts a
            INNER JOIN rtse_centres c
                ON c.id = a.centre_id
            WHERE c.centre_id = ?
            LIMIT 1
            `,
            [String(centreLoginId || "").trim()]
        );

        return rows[0] || null;
    }

    // =====================================
    // Find Account By Centre DB ID
    // =====================================
    static async getByCentreId(centreId) {
        const [rows] = await db.query(
            `
            SELECT
                a.*,
                c.centre_id AS centre_public_id,
                c.centre_code,
                c.centre_name,
                c.centre_type,
                c.status AS centre_status
            FROM rtse_centre_accounts a
            INNER JOIN rtse_centres c
                ON c.id = a.centre_id
            WHERE a.centre_id = ?
            LIMIT 1
            `,
            [centreId]
        );

        return rows[0] || null;
    }

    // =====================================
    // Login
    // =====================================
    static async login(username, password) {
        const account = await this.getByUsername(username);

        if (!account) {
            return null;
        }

        if (account.account_status !== "Active") {
            return null;
        }

        if (account.centre_status !== "Approved") {
            return null;
        }

        const matched = await bcrypt.compare(
            password,
            account.password_hash
        );

        if (!matched) {
            return null;
        }

        return account;
    }

    // =====================================
    // Create Account
    // =====================================
    static async create(centreId, username) {
        const existing = await this.getByCentreId(centreId);

        if (existing) {
            throw new Error("Centre account already exists.");
        }

        const [centreRows] = await db.query(
            `
            SELECT centre_id
            FROM rtse_centres
            WHERE id = ?
            LIMIT 1
            `,
            [centreId]
        );

        const centreLoginId = centreRows[0]?.centre_id;

        if (!centreLoginId) {
            throw new Error("Centre Login ID could not be resolved.");
        }

        const temporaryPassword =
            this.generateTemporaryPassword();

        const passwordHash =
            await bcrypt.hash(temporaryPassword, 10);

        const [result] = await db.query(
            `
            INSERT INTO rtse_centre_accounts
            (
                centre_id,
                username,
                password_hash,
                account_status,
                force_password_change
            )
            VALUES (?, ?, ?, 'Active', 1)
            `,
            [
                centreId,
                centreLoginId,
                passwordHash
            ]
        );

        return {
            id: result.insertId,
            centreId,
            username: centreLoginId,
            temporaryPassword
        };
    }

    // =====================================
    // Update Last Login
    // =====================================
    static async updateLastLogin(id) {
        await db.query(
            `
            UPDATE rtse_centre_accounts
            SET last_login = NOW()
            WHERE id = ?
            `,
            [id]
        );
    }

    // =====================================
    // Change Password
    // =====================================
    static async updatePassword(id, newPassword) {
        const passwordHash =
            await bcrypt.hash(newPassword, 10);

        await db.query(
            `
            UPDATE rtse_centre_accounts
            SET
                password_hash = ?,
                force_password_change = 0
            WHERE id = ?
            `,
            [passwordHash, id]
        );
    }

    // =====================================
    // Reset Password
    // =====================================
    static async resetPassword(centreId) {
        const account =
            await this.getByCentreId(centreId);

        if (!account) {
            return null;
        }

        const temporaryPassword =
            this.generateTemporaryPassword();

        const passwordHash =
            await bcrypt.hash(temporaryPassword, 10);

        await db.query(
            `
            UPDATE rtse_centre_accounts
            SET
                password_hash = ?,
                force_password_change = 1,
                account_status = 'Active'
            WHERE centre_id = ?
            `,
            [
                passwordHash,
                centreId
            ]
        );

        return {
            username: account.centre_public_id,
            temporaryPassword
        };
    }

    // =====================================
    // Force Password Change
    // =====================================
    static async requirePasswordChange(centreId) {
        await db.query(
            `
            UPDATE rtse_centre_accounts
            SET force_password_change = 1
            WHERE centre_id = ?
            `,
            [centreId]
        );
    }

    // =====================================
    // Activate
    // =====================================
    static async activate(centreId) {
        await db.query(
            `
            UPDATE rtse_centre_accounts
            SET account_status = 'Active'
            WHERE centre_id = ?
            `,
            [centreId]
        );
    }

    // =====================================
    // Deactivate
    // =====================================
    static async deactivate(centreId) {
        await db.query(
            `
            UPDATE rtse_centre_accounts
            SET account_status = 'Inactive'
            WHERE centre_id = ?
            `,
            [centreId]
        );
    }

    // =====================================
    // Suspend
    // =====================================
    static async suspend(centreId) {
        await db.query(
            `
            UPDATE rtse_centre_accounts
            SET account_status = 'Suspended'
            WHERE centre_id = ?
            `,
            [centreId]
        );
    }
}

module.exports = RtseCentreAccount;
