const crypto = require("crypto");
const db = require("../config/database");

class RtseResultQr {
    // =====================================
    // Generate a secure Result QR token
    // =====================================
    static generateToken() {
        return "RTSE-RESULT-" + crypto.randomBytes(32).toString("hex");
    }

    // =====================================
    // Create Result QR record if missing
    // =====================================
    static async ensureForApplication(applicationId) {
        const [applications] = await db.query(
            `
            SELECT
                id,
                status,
                admit_generated,
                roll_no,
                archive
            FROM rtse_applications
            WHERE id = ?
            LIMIT 1
            `,
            [applicationId]
        );

        const application = applications[0];

        if (!application) {
            throw new Error("RTSE application not found.");
        }

        // Result QR exists only for a valid generated admit.
        if (
            Number(application.archive) !== 0 ||
            application.status !== "Approved" ||
            Number(application.admit_generated) !== 1 ||
            !application.roll_no
        ) {
            return null;
        }

        const [existing] = await db.query(
            `
            SELECT *
            FROM rtse_result_qr
            WHERE application_id = ?
            LIMIT 1
            `,
            [applicationId]
        );

        if (existing.length) {
            return existing[0];
        }

        const token = this.generateToken();

        await db.query(
            `
            INSERT INTO rtse_result_qr
                (application_id, qr_token)
            VALUES (?, ?)
            `,
            [
                applicationId,
                token
            ]
        );

        const [rows] = await db.query(
            `
            SELECT *
            FROM rtse_result_qr
            WHERE application_id = ?
            LIMIT 1
            `,
            [applicationId]
        );

        return rows[0] || null;
    }

    // =====================================
    // Create Result QR records for
    // generated-admit students in a section
    // =====================================
    static async ensureForSection(section, applicationYear) {
        const normalizedSection =
            String(section || "").trim().toUpperCase();

        const normalizedYear =
            Number(applicationYear);

        if (
            !["A", "B", "C", "D", "E"].includes(
                normalizedSection
            )
        ) {
            throw new Error("Invalid RTSE section.");
        }

        if (!normalizedYear) {
            throw new Error("Invalid RTSE application year.");
        }

        const [students] = await db.query(
            `
            SELECT id
            FROM rtse_applications
            WHERE archive = 0
              AND status = 'Approved'
              AND application_year = ?
              AND roll_no IS NOT NULL
              AND admit_generated = 1
              AND section = ?
            `,
            [
                normalizedYear,
                normalizedSection
            ]
        );

        let created = 0;

        for (const student of students) {
            const [existing] = await db.query(
                `
                SELECT id
                FROM rtse_result_qr
                WHERE application_id = ?
                LIMIT 1
                `,
                [student.id]
            );

            if (existing.length) {
                continue;
            }

            const token = this.generateToken();

            await db.query(
                `
                INSERT INTO rtse_result_qr
                    (application_id, qr_token)
                VALUES (?, ?)
                `,
                [
                    student.id,
                    token
                ]
            );

            created++;
        }

        return created;
    }

    // =====================================
    // Get Result QR by token
    // =====================================
    static async getByToken(token) {
        const normalizedToken =
            String(token || "").trim();

        if (!normalizedToken) {
            return null;
        }

        const [rows] = await db.query(
            `
            SELECT
                result_qr.id,
                result_qr.application_id,
                result_qr.qr_token,
                result_qr.created_at,

                application.registration_no,
                application.roll_no,
                application.full_name,
                application.father_name,
                application.school_name,
                application.class,
                application.section,
                application.photo,
                application.status,
                application.admit_generated,
                application.archive

            FROM rtse_result_qr result_qr

            INNER JOIN rtse_applications application
                ON application.id = result_qr.application_id

            WHERE result_qr.qr_token = ?

            LIMIT 1
            `,
            [normalizedToken]
        );

        return rows[0] || null;
    }

    // =====================================
    // Get Result QR by application
    // =====================================
    static async getByApplication(applicationId) {
        const [rows] = await db.query(
            `
            SELECT *
            FROM rtse_result_qr
            WHERE application_id = ?
            LIMIT 1
            `,
            [applicationId]
        );

        return rows[0] || null;
    }
}

module.exports = RtseResultQr;
