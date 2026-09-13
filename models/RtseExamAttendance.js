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
    // Get Attendance Sheet by Section
    // Uses only generated-admit students.
    // This is intentionally separate from the
    // shared/legacy RtseSeatPlan.getRoomWise().
    // =====================================
    static async getAttendanceSheetBySection(section, applicationYear) {
        const normalizedSection = String(section || "").trim().toUpperCase();
        const normalizedYear = Number(applicationYear);

        if (!["A", "B", "C", "D", "E"].includes(normalizedSection)) {
            throw new Error("Invalid RTSE section.");
        }

        if (!Number.isInteger(normalizedYear) || normalizedYear < 1) {
            throw new Error("Invalid RTSE application year.");
        }

        const [rooms] = await db.query(
            `
            SELECT
                room_no,
                COUNT(*) AS total_students
            FROM rtse_applications
            WHERE archive = 0
              AND application_year = ?
              AND section = ?
              AND status = 'Approved'
              AND roll_no IS NOT NULL
              AND admit_generated = 1
              AND room_no IS NOT NULL
            GROUP BY room_no
            ORDER BY room_no ASC
            `,
            [normalizedYear, normalizedSection]
        );

        for (const room of rooms) {
            const [students] = await db.query(
                `
                SELECT
                    roll_no,
                    registration_no,
                    full_name,
                    school_name,
                    seat_no
                FROM rtse_applications
                WHERE archive = 0
                  AND application_year = ?
                  AND section = ?
                  AND status = 'Approved'
                  AND roll_no IS NOT NULL
                  AND admit_generated = 1
                  AND room_no = ?
                ORDER BY seat_no ASC
                `,
                [normalizedYear, normalizedSection, room.room_no]
            );

            room.students = students;
        }

        return rooms;
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
    // Result Dashboard Attendance Statistics
    // Read-only aggregation of eligible RTSE
    // students by current attendance state.
    //
    // Eligibility matches the existing
    // generated-admit attendance rules.
    // =====================================
    static async getResultDashboardStatistics(applicationYear) {
        const normalizedYear = Number(applicationYear);

        if (!Number.isInteger(normalizedYear) || normalizedYear < 1) {
            throw new Error("Invalid RTSE application year.");
        }

        const [rows] = await db.query(
            `
            SELECT
                a.section,
                COUNT(DISTINCT a.id) AS eligible_students,
                COUNT(
                    DISTINCT CASE
                        WHEN ea.attendance_status = 'PRESENT'
                        THEN a.id
                    END
                ) AS present_students
            FROM rtse_applications a
            LEFT JOIN rtse_exam_attendance ea
                ON ea.application_id = a.id
            WHERE
                a.archive = 0
                AND a.status = 'Approved'
                AND a.application_year = ?
                AND a.roll_no IS NOT NULL
                AND a.admit_generated = 1
                AND a.section IN ('A', 'B', 'C', 'D', 'E')
            GROUP BY a.section
            ORDER BY FIELD(a.section, 'A', 'B', 'C', 'D', 'E')
            `,
            [normalizedYear]
        );

        const fixedSections = ['A', 'B', 'C', 'D', 'E'];
        const bySection = {};

        for (const row of rows) {
            const section = String(row.section || '').trim().toUpperCase();

            if (!fixedSections.includes(section)) {
                continue;
            }

            const eligible = Number(row.eligible_students || 0);
            const present = Number(row.present_students || 0);

            bySection[section] = {
                section,
                eligible,
                present,
                absent: Math.max(0, eligible - present)
            };
        }

        const sections = fixedSections.map(section => {
            return bySection[section] || {
                section,
                eligible: 0,
                present: 0,
                absent: 0
            };
        });

        const overall = sections.reduce(
            (totals, section) => {
                totals.eligible += section.eligible;
                totals.present += section.present;
                totals.absent += section.absent;
                return totals;
            },
            {
                eligible: 0,
                present: 0,
                absent: 0
            }
        );

        return {
            overall,
            sections
        };
    }

    // =====================================
    // Get ABSENT / NOT SCANNED Students
    // Read-only result-dashboard student list.
    // Only eligible students without confirmed
    // PRESENT gate entry are returned.
    // =====================================
    static async getAbsentStudents(applicationYear) {
        const normalizedYear = Number(applicationYear);

        if (!Number.isInteger(normalizedYear) || normalizedYear < 1) {
            throw new Error("Invalid RTSE application year.");
        }

        const [rows] = await db.query(
            `
            SELECT
                a.id,
                a.roll_no,
                a.registration_no,
                a.full_name,
                a.school_name,
                a.section,
                ea.attendance_status,
                ea.scanned_at,
                r.id AS result_id,
                r.marks,
                r.percentage,
                r.grade,
                r.result_status
            FROM rtse_applications a
            LEFT JOIN rtse_exam_attendance ea
                ON ea.application_id = a.id
            LEFT JOIN rtse_results r
                ON r.application_id = a.id
            WHERE
                a.archive = 0
                AND a.status = 'Approved'
                AND a.application_year = ?
                AND a.roll_no IS NOT NULL
                AND a.admit_generated = 1
                AND a.section IN ('A', 'B', 'C', 'D', 'E')
                AND (
                    ea.application_id IS NULL
                    OR ea.attendance_status IS NULL
                    OR ea.attendance_status <> 'PRESENT'
                )
            ORDER BY
                FIELD(a.section, 'A', 'B', 'C', 'D', 'E'),
                a.roll_no ASC,
                a.full_name ASC
            `,
            [normalizedYear]
        );

        return rows;
    }

    // =====================================
    // Get PRESENT Students by Section
    // Read-only result-entry student list.
    // Only successfully confirmed gate-entry
    // students are returned.
    // =====================================
    static async getPresentStudentsBySection(section, applicationYear) {
        const normalizedSection =
            String(section || "").trim().toUpperCase();

        const normalizedYear = Number(applicationYear);

        if (!["A", "B", "C", "D", "E"].includes(normalizedSection)) {
            throw new Error("Invalid RTSE section.");
        }

        if (!Number.isInteger(normalizedYear) || normalizedYear < 1) {
            throw new Error("Invalid RTSE application year.");
        }

        const [rows] = await db.query(
            `
            SELECT
                a.id,
                a.roll_no,
                a.registration_no,
                a.full_name,
                a.school_name,
                a.section,
                ea.attendance_status,
                ea.scanned_at,
                r.id AS result_id,
                r.marks,
                r.percentage,
                r.grade,
                r.result_status
            FROM rtse_applications a
            INNER JOIN rtse_exam_attendance ea
                ON ea.application_id = a.id
                AND ea.attendance_status = 'PRESENT'
            LEFT JOIN rtse_results r
                ON r.application_id = a.id
            WHERE
                a.archive = 0
                AND a.status = 'Approved'
                AND a.application_year = ?
                AND a.roll_no IS NOT NULL
                AND a.admit_generated = 1
                AND a.section = ?
            ORDER BY
                a.roll_no ASC,
                a.full_name ASC
            `,
            [normalizedYear, normalizedSection]
        );

        return rows;
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
