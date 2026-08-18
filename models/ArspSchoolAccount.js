const db = require("../config/database");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class ArspSchoolAccount {

    // =====================================
    // Generate Temporary Password
    // =====================================
    static generateTemporaryPassword() {
        return crypto.randomBytes(6).toString("base64url");
    }

    // =====================================
    // Create School Account
    // =====================================
    static async create(schoolId, username) {

        const temporaryPassword =
            this.generateTemporaryPassword();

        const passwordHash =
            await bcrypt.hash(temporaryPassword, 10);

        const [result] = await db.query(
            `
            INSERT INTO arsp_school_accounts
            (
                school_id,
                username,
                password_hash,
                account_status,
                force_password_change
            )
            VALUES (?, ?, ?, 'Active', 1)
            `,
            [
                schoolId,
                username,
                passwordHash
            ]
        );

        return {
            id: result.insertId,
            schoolId,
            username,
            temporaryPassword
        };
    }

    // =====================================
    // Find By Username
    // =====================================
    static async getByUsername(username) {

        const [rows] = await db.query(
            `
            SELECT *
            FROM arsp_school_accounts
            WHERE username = ?
            LIMIT 1
            `,
            [username]
        );

        return rows[0] || null;
    }

    // =====================================
    // Find By School ID
    // =====================================
    static async getBySchoolId(schoolId) {

        const [rows] = await db.query(
            `
            SELECT *
            FROM arsp_school_accounts
            WHERE school_id = ?
            LIMIT 1
            `,
            [schoolId]
        );

        return rows[0] || null;
    }

    // =====================================
    // Login
    // =====================================
    static async login(username, password) {

        const account =
            await this.getByUsername(username);

        if (!account) {
            return null;
        }

        if (account.account_status !== "Active") {
            return null;
        }

        const matched =
            await bcrypt.compare(
                password,
                account.password_hash
            );

        if (!matched) {
            return null;
        }

        return account;
    }

    // =====================================
    // Update Last Login
    // =====================================
    static async updateLastLogin(id) {

        await db.query(
            `
            UPDATE arsp_school_accounts
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
            UPDATE arsp_school_accounts
            SET
                password_hash = ?,
                force_password_change = 0
            WHERE id = ?
            `,
            [
                passwordHash,
                id
            ]
        );
    }

    // =====================================
    // Force Password Change
    // =====================================
    static async requirePasswordChange(schoolId) {

        await db.query(
            `
            UPDATE arsp_school_accounts
            SET force_password_change = 1
            WHERE school_id = ?
            `,
            [schoolId]
        );
    }

    // =====================================
    // Reset Password
    // =====================================
    static async resetPassword(schoolId) {

        const account =
            await this.getBySchoolId(schoolId);

        if (!account) {
            return null;
        }

        const temporaryPassword =
            this.generateTemporaryPassword();

        const passwordHash =
            await bcrypt.hash(
                temporaryPassword,
                10
            );

        await db.query(
            `
            UPDATE arsp_school_accounts
            SET
                password_hash = ?,
                force_password_change = 1,
                account_status = 'Active'
            WHERE school_id = ?
            `,
            [
                passwordHash,
                schoolId
            ]
        );

        return {
            username: account.username,
            temporaryPassword
        };
    }

    // =====================================
    // Activate
    // =====================================
    static async activate(schoolId) {

        await db.query(
            `
            UPDATE arsp_school_accounts
            SET account_status = 'Active'
            WHERE school_id = ?
            `,
            [schoolId]
        );
    }

    // =====================================
    // Deactivate
    // =====================================
    static async deactivate(schoolId) {

        await db.query(
            `
            UPDATE arsp_school_accounts
            SET account_status = 'Inactive'
            WHERE school_id = ?
            `,
            [schoolId]
        );
    }
}

module.exports = ArspSchoolAccount;
