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

        // Attendance exists only for a valid generated admit.
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

        // IMPORTANT:
        // No admit = no attendance record.
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
            FROM rtse_exam_attendance
            WHERE application_id = ?
            LIMIT 1
            `,
            [applicationId]
        );

        if (existing.length) {

            // Existing attendance record is preserved.
            // Only repair a missing QR token.
            if (
                !existing[0].qr_token ||
                String(existing[0].qr_token).trim() === ""
            ) {

                const token = this.generateToken();

                await db.query(
                    `
                    UPDATE rtse_exam_attendance
                    SET qr_token = ?
                    WHERE id = ?
                    `,
                    [
                        token,
                        existing[0].id
                    ]
                );

                existing[0].qr_token = token;
            }

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
            VALUES (?, ?, 'NOT_SCANNED')
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
    static async ensureForSection(section, applicationYear) {

        const normalizedSection =
            String(section || "").trim().toUpperCase();

        const normalizedYear =
            Number(applicationYear);

        if(!["A","B","C","D","E"].includes(normalizedSection)){
            throw new Error("Invalid RTSE section.");
        }

        if(!normalizedYear){
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
                VALUES (?, ?, 'NOT_SCANNED')
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
    // Attendance Status Reset
    // PRESENT -> NOT_SCANNED
    // =====================================

    // =====================================
    // Attendance Status Reset
    // PRESENT -> NOT_SCANNED
    //
    // Only a PRESENT attendance record can be
    // reset. The same admit-card QR can then
    // be scanned again.
    // =====================================
    static async resetAttendanceStatus(applicationId) {
        const [result] = await db.query(
            `
            UPDATE rtse_exam_attendance
            SET
                attendance_status = 'NOT_SCANNED',
                scanned_at = NULL,
                scanned_by = NULL
            WHERE application_id = ?
              AND attendance_status = 'PRESENT'
            `,
            [
                applicationId
            ]
        );

        return result.affectedRows > 0;
    }

    // =====================================
    // Automatically mark unscanned students
    // ABSENT after examination end time
    // =====================================
    static async markExpiredUnscannedAbsent() {
        const [result] = await db.query(`
            UPDATE rtse_exam_attendance ea
            INNER JOIN rtse_applications a
                ON a.id = ea.application_id
            INNER JOIN rtse_exam_settings es
                ON es.exam_year = a.application_year
            SET
                ea.attendance_status = 'ABSENT',
                ea.scanned_at = NULL,
                ea.scanned_by = NULL
            WHERE
                ea.attendance_status = 'NOT_SCANNED'
                AND es.status = 'ACTIVE'
                AND TIMESTAMP(es.exam_date, es.exam_end_time) <= NOW()
        `);

        return result.affectedRows;
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
