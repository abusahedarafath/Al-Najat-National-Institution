const db = require("../config/database");

class ArspAdmitDownload {

    static async ensureTables() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS arsp_admit_downloads (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                application_id BIGINT UNSIGNED NOT NULL,
                registration_no VARCHAR(100) NOT NULL,
                student_name VARCHAR(255) NOT NULL,

                member_id VARCHAR(100) NOT NULL,
                member_name VARCHAR(255) NOT NULL,
                designation VARCHAR(255) DEFAULT NULL,
                member_email VARCHAR(320) DEFAULT NULL,
                member_mobile VARCHAR(20) DEFAULT NULL,

                verified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                downloaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                ip_address VARCHAR(45) DEFAULT NULL,
                user_agent TEXT DEFAULT NULL,

                PRIMARY KEY (id),
                KEY idx_arsp_admit_application (application_id),
                KEY idx_arsp_admit_registration (registration_no),
                KEY idx_arsp_admit_member (member_id),
                KEY idx_arsp_admit_downloaded_at (downloaded_at)
            ) ENGINE=InnoDB
              DEFAULT CHARSET=utf8mb4
              COLLATE=utf8mb4_unicode_ci
        `);

        // =================================================
        // ADDITIVE HISTORY COLUMNS
        // Existing records/data are preserved.
        // =================================================
        const extraColumns = [
            ["school_name", "VARCHAR(255) DEFAULT NULL"],
            ["father_name", "VARCHAR(255) DEFAULT NULL"],
            ["student_class", "VARCHAR(100) DEFAULT NULL"],
            ["section", "VARCHAR(100) DEFAULT NULL"],
            ["exam_year", "VARCHAR(20) DEFAULT NULL"],
            ["exam_shift", "VARCHAR(100) DEFAULT NULL"],
            ["exam_centre", "VARCHAR(255) DEFAULT NULL"]
        ];

        for (const [column, definition] of extraColumns) {
            const [columns] = await db.query(
                `
                SELECT COUNT(*) AS total
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'arsp_admit_downloads'
                  AND COLUMN_NAME = ?
                `,
                [column]
            );

            if (Number(columns[0]?.total || 0) === 0) {
                await db.query(
                    `ALTER TABLE arsp_admit_downloads ADD COLUMN ${column} ${definition}`
                );
            }
        }
    }

    static async create(data) {
        await this.ensureTables();

        const [result] = await db.query(
            `
            INSERT INTO arsp_admit_downloads (
                application_id,
                registration_no,
                student_name,
                school_name,
                father_name,
                student_class,
                section,

                member_id,
                member_name,
                designation,
                member_email,
                member_mobile,

                exam_year,
                exam_shift,
                exam_centre,

                verified_at,
                downloaded_at,
                ip_address,
                user_agent
            )
            VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, NOW(), ?, ?
            )
            `,
            [
                data.applicationId,
                data.registrationNo,
                data.studentName,

                data.schoolName || null,
                data.fatherName || null,
                data.studentClass || null,
                data.section || null,

                data.memberId,
                data.memberName,
                data.designation || null,
                data.memberEmail || null,
                data.memberMobile || null,

                data.examYear || null,
                data.examShift || null,
                data.examCentre || null,

                data.verifiedAt || new Date(),
                data.ipAddress || null,
                data.userAgent || null
            ]
        );

        return {
            id: result.insertId
        };
    }

    static async getAll(options = {}) {
        await this.ensureTables();

        const [rows] = await db.query(
            `
            SELECT
                id,
                application_id,
                registration_no,
                student_name,
                school_name,
                father_name,
                student_class,
                section,

                member_id,
                member_name,
                designation,
                member_email,
                member_mobile,

                exam_year,
                exam_shift,
                exam_centre,

                verified_at,
                downloaded_at,
                ip_address,
                user_agent

            FROM arsp_admit_downloads
            ORDER BY downloaded_at DESC
            `,
            []
        );

        return rows;
    }

    static async searchAll(search = "") {
        await this.ensureTables();

        const term =
            String(search || "").trim();

        if (!term) {
            const [rows] = await db.query(`
                SELECT
                    id,
                    application_id,
                    registration_no,
                    student_name,
                    school_name,
                    father_name,
                    student_class,
                    section,

                    member_id,
                    member_name,
                    designation,
                    member_email,
                    member_mobile,

                    exam_year,
                    exam_shift,
                    exam_centre,

                    verified_at,
                    downloaded_at,
                    ip_address,
                    user_agent

                FROM arsp_admit_downloads
                ORDER BY downloaded_at DESC
            `);

            return rows;
        }

        const like = `%${term}%`;

        const [rows] = await db.query(
            `
            SELECT
                id,
                application_id,
                registration_no,
                student_name,
                school_name,
                father_name,
                student_class,
                section,

                member_id,
                member_name,
                designation,
                member_email,
                member_mobile,

                exam_year,
                exam_shift,
                exam_centre,

                verified_at,
                downloaded_at,
                ip_address,
                user_agent

            FROM arsp_admit_downloads

            WHERE
                CAST(id AS CHAR) LIKE ?
                OR CAST(application_id AS CHAR) LIKE ?
                OR registration_no LIKE ?
                OR student_name LIKE ?
                OR school_name LIKE ?
                OR father_name LIKE ?
                OR student_class LIKE ?
                OR section LIKE ?

                OR member_id LIKE ?
                OR member_name LIKE ?
                OR designation LIKE ?
                OR member_email LIKE ?
                OR member_mobile LIKE ?

                OR CAST(exam_year AS CHAR) LIKE ?
                OR exam_shift LIKE ?
                OR exam_centre LIKE ?

                OR CAST(verified_at AS CHAR) LIKE ?
                OR CAST(downloaded_at AS CHAR) LIKE ?
                OR ip_address LIKE ?

            ORDER BY downloaded_at DESC
            `,
            [
                like,
                like,

                like,
                like,
                like,
                like,
                like,
                like,
                like,

                like,
                like,
                like,
                like,
                like,

                like,
                like,
                like,

                like,
                like,
                like
            ]
        );

        return rows;
    }

    static async count() {
        await this.ensureTables();

        const [rows] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM arsp_admit_downloads
            `
        );

        return Number(rows[0]?.total || 0);
    }
}

module.exports = ArspAdmitDownload;
