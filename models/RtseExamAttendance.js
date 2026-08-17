const crypto = require("crypto");
const db = require("../config/database");

class RtseExamAttendance {

    // =====================================
    // Generate a secure QR token
    // =====================================
    static generateToken() {
        return "RTSE-" + crypto.randomBytes(32).toString("hex");
    }


    // =====================================
    // Create attendance record if missing
    // =====================================
    static async ensureForApplication(applicationId) {

        const [existing] = await db.query(
            `
            SELECT *
            FROM rtse_exam_attendance
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
            INSERT INTO rtse_exam_attendance
            (
                application_id,
                qr_token,
                attendance_status
            )
            VALUES (?, ?, 'ABSENT')
            `,
            [
                applicationId,
                token
            ]
        );

        const [rows] = await db.query(
            `
            SELECT *
            FROM rtse_exam_attendance
            WHERE application_id = ?
            LIMIT 1
            `,
            [applicationId]
        );

        return rows[0];
    }


    // =====================================
    // Create QR records for generated admits
    // =====================================
    static async ensureForSection(section) {

        const [students] = await db.query(
            `
            SELECT id
            FROM rtse_applications
            WHERE archive = 0
              AND status = 'Approved'
              AND roll_no IS NOT NULL
              AND admit_generated = 1
              AND section = ?
            `,
            [section]
        );

        let created = 0;

        for (const student of students) {

            const [existing] = await db.query(
                `
                SELECT id
                FROM rtse_exam_attendance
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
                INSERT INTO rtse_exam_attendance
                (
                    application_id,
                    qr_token,
                    attendance_status
                )
                VALUES (?, ?, 'ABSENT')
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
    // Get attendance by application
    // =====================================
    static async getByApplication(applicationId) {

        const [rows] = await db.query(
            `
            SELECT
                *
            FROM rtse_exam_attendance
            WHERE application_id = ?
            LIMIT 1
            `,
            [applicationId]
        );

        return rows[0] || null;
    }


    // =====================================
    // Get attendance by QR token
    // =====================================
    static async getByToken(token) {

        const [rows] = await db.query(
            `
            SELECT
                attendance.id,
                attendance.application_id,
                attendance.qr_token,
                attendance.attendance_status,
                attendance.scanned_at,
                attendance.scanned_by,

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

            FROM rtse_exam_attendance attendance

            INNER JOIN rtse_applications application
                ON application.id = attendance.application_id

            WHERE attendance.qr_token = ?

            LIMIT 1
            `,
            [token]
        );

        return rows[0] || null;
    }


    // =====================================
    // Mark student ABSENT / Return to Application Dashboard
    // =====================================

    static async markAbsent(applicationId) {

        const [result] = await db.query(
            `
            UPDATE rtse_exam_attendance

            SET
                attendance_status = 'ABSENT',
                scanned_at = NULL,
                scanned_by = NULL

            WHERE application_id = ?
            `,
            [
                applicationId
            ]
        );

        return result.affectedRows > 0;
    }


    // =====================================
    // Mark student PRESENT
    // =====================================
    static async markPresent(applicationId, scannerUserId) {

        const [result] = await db.query(
            `
            UPDATE rtse_exam_attendance

            SET
                attendance_status = 'PRESENT',
                scanned_at = NOW(),
                scanned_by = ?

            WHERE application_id = ?
              AND attendance_status <> 'PRESENT'
            `,
            [
                scannerUserId,
                applicationId
            ]
        );

        return result.affectedRows > 0;
    }

}

module.exports = RtseExamAttendance;
