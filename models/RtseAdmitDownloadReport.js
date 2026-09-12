const db = require("../config/database");

class RtseAdmitDownloadReport {

    static async getReport(options = {}) {
        const classValue = String(options.classValue || "").trim();
        const section = String(options.section || "").trim().toUpperCase();
        const search = String(options.search || "").trim();

        const conditions = [
            "ra.archive = 0",
            "ra.admit_generated = 1"
        ];

        const params = [];

        if (/^\d+$/.test(classValue)) {
            conditions.push("ra.class = ?");
            params.push(Number(classValue));
        }

        if (/^[A-Z]$/.test(section)) {
            conditions.push("UPPER(ra.section) = ?");
            params.push(section);
        }

        if (search) {
            const like = `%${search}%`;
            conditions.push(`(
                ra.registration_no LIKE ?
                OR ra.full_name LIKE ?
                OR ra.father_name LIKE ?
                OR ra.school_name LIKE ?
            )`);
            params.push(like, like, like, like);
        }

        const where = conditions.join(" AND ");

        /*
         * Important:
         * Aggregate both existing download-history tables first.
         * This means repeated downloads become one count per student.
         * Nothing is inserted, changed, or deleted.
         */
        const [rows] = await db.query(
            `
            SELECT
                ra.id,
                ra.registration_no,
                ra.full_name,
                ra.father_name,
                ra.school_name,
                ra.class AS student_class,
                ra.section,

                COALESCE(downloads.download_count, 0) AS download_count

            FROM rtse_applications ra

            LEFT JOIN (
                SELECT
                    registration_no,
                    COUNT(*) AS download_count
                FROM (
                    SELECT
                        registration_no COLLATE utf8mb4_unicode_ci AS registration_no
                    FROM rtse_admit_downloads

                    UNION ALL

                    SELECT
                        registration_no COLLATE utf8mb4_unicode_ci AS registration_no
                    FROM arsp_admit_downloads
                ) AS all_downloads
                GROUP BY registration_no
            ) AS downloads
                ON downloads.registration_no COLLATE utf8mb4_unicode_ci
                 = ra.registration_no COLLATE utf8mb4_unicode_ci

            WHERE ${where}

            ORDER BY
                ra.section ASC,
                ra.full_name ASC,
                ra.registration_no ASC
            `,
            params
        );

        const summary = rows.reduce(
            (acc, row) => {
                acc.totalStudents += 1;

                const count = Number(row.download_count || 0);

                if (count > 0) {
                    acc.downloadedStudents += 1;
                    acc.totalDownloads += count;
                } else {
                    acc.notDownloaded += 1;
                }

                return acc;
            },
            {
                totalStudents: 0,
                downloadedStudents: 0,
                notDownloaded: 0,
                totalDownloads: 0
            }
        );

        const sections = [];
        const sectionMap = new Map();

        for (const row of rows) {
            const count = Number(row.download_count || 0);

            // The report is specifically for students whose
            // admit card has been downloaded at least once.
            if (count <= 0) {
                continue;
            }

            const key = String(row.section || "-").trim() || "-";

            if (!sectionMap.has(key)) {
                const group = {
                    section: key,
                    students: [],
                    totalStudents: 0,
                    downloadedStudents: 0,
                    notDownloaded: 0,
                    totalDownloads: 0
                };

                sectionMap.set(key, group);
                sections.push(group);
            }

            const group = sectionMap.get(key);

            group.students.push({
                ...row,
                download_count: count
            });

            group.totalStudents += 1;
            group.downloadedStudents += 1;
            group.totalDownloads += count;
        }

        return {
            rows,
            sections,
            summary,
            filters: {
                classValue,
                section,
                search
            }
        };
    }


    static async getSectionReport(section, options = {}) {
        const sectionValue = String(section || "").trim().toUpperCase();
        const classValue = String(options.classValue || "").trim();
        const search = String(options.search || "").trim();

        const conditions = [
            "ra.archive = 0",
            "ra.admit_generated = 1",
            "UPPER(TRIM(ra.section)) = ?"
        ];

        const params = [sectionValue];

        if (/^\d+$/.test(classValue)) {
            conditions.push("ra.class = ?");
            params.push(Number(classValue));
        }

        if (search) {
            const like = `%${search}%`;

            conditions.push(`(
                ra.registration_no LIKE ?
                OR ra.full_name LIKE ?
                OR ra.father_name LIKE ?
                OR ra.school_name LIKE ?
            )`);

            params.push(like, like, like, like);
        }

        const where = conditions.join(" AND ");

        const [rows] = await db.query(
            `
            SELECT
                ra.id,
                ra.registration_no,
                ra.full_name,
                ra.father_name,
                ra.school_name,
                ra.class AS student_class,
                ra.section,

                COALESCE(downloads.download_count, 0) AS download_count

            FROM rtse_applications ra

            LEFT JOIN (
                SELECT
                    registration_no,
                    COUNT(*) AS download_count
                FROM (
                    SELECT
                        registration_no COLLATE utf8mb4_unicode_ci AS registration_no
                    FROM rtse_admit_downloads

                    UNION ALL

                    SELECT
                        registration_no COLLATE utf8mb4_unicode_ci AS registration_no
                    FROM arsp_admit_downloads
                ) AS all_downloads
                GROUP BY registration_no
            ) AS downloads
                ON downloads.registration_no COLLATE utf8mb4_unicode_ci
                 = ra.registration_no COLLATE utf8mb4_unicode_ci

            WHERE ${where}
              AND COALESCE(downloads.download_count, 0) > 0

            ORDER BY
                ra.full_name ASC,
                ra.registration_no ASC
            `,
            params
        );

        const totalDownloads = rows.reduce(
            (total, row) => total + Number(row.download_count || 0),
            0
        );

        // Count every student in the section independently from
        // the downloaded-student result. This ensures the detail
        // page can show Total / Downloaded / Not Downloaded while
        // keeping the student table limited to downloaded students.
        const countConditions = [
            "archive = 0",
            "admit_generated = 1",
            "UPPER(TRIM(section)) = ?"
        ];

        const countParams = [sectionValue];

        if (/^\d+$/.test(classValue)) {
            countConditions.push("class = ?");
            countParams.push(Number(classValue));
        }

        const [countRows] = await db.query(
            `
            SELECT COUNT(*) AS total_students
            FROM rtse_applications
            WHERE ${countConditions.join(" AND ")}
            `,
            countParams
        );

        const totalStudents =
            Number(countRows[0]?.total_students || 0);

        return {
            section: sectionValue,
            students: rows.map(row => ({
                ...row,
                download_count: Number(row.download_count || 0)
            })),
            totalStudents,
            downloadedStudents: rows.length,
            notDownloaded: Math.max(
                totalStudents - rows.length,
                0
            ),
            totalDownloads,
            filters: {
                classValue,
                search
            }
        };
    }

    static async getClasses() {
        const [rows] = await db.query(`
            SELECT DISTINCT class
            FROM rtse_applications
            WHERE archive = 0
              AND admit_generated = 1
            ORDER BY class ASC
        `);

        return rows.map(row => Number(row.class));
    }

    static async getSections() {
        const [rows] = await db.query(`
            SELECT DISTINCT section
            FROM rtse_applications
            WHERE archive = 0
              AND admit_generated = 1
              AND section IS NOT NULL
              AND TRIM(section) <> ''
            ORDER BY section ASC
        `);

        return rows.map(row => String(row.section).trim());
    }
}

module.exports = RtseAdmitDownloadReport;
