const db = require("../config/database");
const recordsDb = db.recordsPool;

class RtseRecords {
    // --------------------------------------------------------
    // Historical RTSE years
    // --------------------------------------------------------
    static async getYears() {
        const [rows] = await recordsDb.query(`
            SELECT DISTINCT application_year
            FROM records_applications
            WHERE application_year IS NOT NULL
            ORDER BY application_year DESC
        `);

        return rows.map(row => Number(row.application_year)).filter(Boolean);
    }

    // --------------------------------------------------------
    // Centres available for a selected historical year.
    // Uses year-specific school-centre assignments.
    // --------------------------------------------------------
    static async getCentres(applicationYear = "") {
        const year = String(applicationYear || "").trim();
        const params = [];

        let sql = `
            SELECT DISTINCT
                c.id,
                c.centre_id AS centre_public_id,
                c.centre_code,
                c.centre_name,
                c.centre_type,
                c.status
            FROM records_school_centre_assignments sca
            INNER JOIN records_centres c
                ON c.application_year = sca.application_year
                AND c.id = sca.centre_id
            WHERE sca.status IN ('Approved', 'Active')
        `;

        if (/^\d{4}$/.test(year)) {
            sql += ` AND sca.application_year = ?`;
            params.push(Number(year));
        }

        sql += `
            ORDER BY
                c.centre_name ASC,
                c.centre_code ASC
        `;

        const [rows] = await recordsDb.query(sql, params);
        return rows;
    }

    // --------------------------------------------------------
    // Build the common historical-record scope.
    // Centre is linked through school + application year.
    // --------------------------------------------------------
    static buildScope(filters = {}) {
        const search = String(filters.search || "").trim();
        const year = String(filters.year || "").trim();
        const centreId = String(filters.centreId || "").trim();

        const params = [];

        let sql = `
            FROM records_applications a
            LEFT JOIN records_school_centre_assignments sca
                ON sca.school_id = a.school_id
                AND sca.application_year = a.application_year
                AND sca.status IN ('Approved', 'Active')
            LEFT JOIN records_centres c
                ON c.application_year = a.application_year
                AND c.id = sca.centre_id
            LEFT JOIN records_schools s
                ON s.application_year = a.application_year
                AND s.id = a.school_id
            LEFT JOIN records_exam_attendance ea
                ON ea.application_year = a.application_year
                AND ea.application_id = a.id
            LEFT JOIN records_results r
                ON r.application_year = a.application_year
                AND r.application_id = a.id
            WHERE 1 = 1
        `;

        if (/^\d{4}$/.test(year)) {
            sql += ` AND a.application_year = ?`;
            params.push(Number(year));
        }

        if (/^\d+$/.test(centreId)) {
            sql += ` AND c.id = ?`;
            params.push(Number(centreId));
        }

        if (search) {
            const like = `%${search}%`;

            sql += `
                AND (
                    a.registration_no LIKE ?
                    OR a.full_name LIKE ?
                    OR a.father_name LIKE ?
                    OR a.mother_name LIKE ?
                    OR a.mobile LIKE ?
                    OR a.email LIKE ?
                    OR a.school_name LIKE ?
                    OR s.school_code LIKE ?
                    OR s.school_name LIKE ?
                    OR c.centre_code LIKE ?
                    OR c.centre_name LIKE ?
                    OR a.section LIKE ?
                    OR a.gender LIKE ?
                    OR a.roll_no LIKE ?
                    OR CAST(a.roll_number AS CHAR) LIKE ?
                    OR CAST(a.class AS CHAR) LIKE ?
                    OR a.district LIKE ?
                    OR a.state LIKE ?
                )
            `;

            for (let i = 0; i < 18; i++) {
                params.push(like);
            }
        }

        return { sql, params };
    }

    // --------------------------------------------------------
    // Main dashboard data.
    // IMPORTANT:
    // Main students are filtered ONLY by search/year/centre.
    // --------------------------------------------------------
    static async getDashboardData(filters = {}) {
        const scope = this.buildScope(filters);

        const [studentRows] = await recordsDb.query(`
            SELECT DISTINCT
                a.id,
                a.registration_no,
                a.full_name,
                a.father_name,
                a.mother_name,
                a.mobile,
                a.email,
                a.gender,
                a.dob,
                a.school_id,
                a.school_name,
                a.class,
                a.section,
                a.roll_no,
                a.roll_number,
                a.status AS application_status,
                a.application_year,
                a.district,
                a.state,
                a.pincode,
                a.address,
                c.id AS centre_id,
                c.centre_code,
                c.centre_name,
                c.centre_type,
                ea.attendance_status,
                ea.scanned_at,
                r.id AS result_id,
                r.marks,
                r.total_marks,
                r.total_full_marks,
                r.percentage,
                r.grade,
                r.result_status
            ${scope.sql}
            ORDER BY
                a.application_year DESC,
                UPPER(TRIM(a.section)) ASC,
                a.roll_no ASC,
                a.full_name ASC
        `, scope.params);

        const [sectionRows] = await recordsDb.query(`
            SELECT
                UPPER(TRIM(a.section)) AS section,
                COUNT(DISTINCT a.id) AS total_students,
                SUM(
                    CASE
                        WHEN UPPER(COALESCE(a.gender, '')) IN ('MALE', 'M')
                        THEN 1 ELSE 0
                    END
                ) AS male_students,
                SUM(
                    CASE
                        WHEN UPPER(COALESCE(a.gender, '')) IN ('FEMALE', 'F')
                        THEN 1 ELSE 0
                    END
                ) AS female_students,
                SUM(
                    CASE
                        WHEN ea.attendance_status = 'PRESENT'
                        THEN 1 ELSE 0
                    END
                ) AS present_students,
                SUM(
                    CASE
                        WHEN ea.attendance_status = 'ABSENT'
                        OR ea.attendance_status IS NULL
                        OR ea.attendance_status <> 'PRESENT'
                        THEN 1 ELSE 0
                    END
                ) AS absent_students
            ${scope.sql}
            AND NULLIF(TRIM(a.section), '') IS NOT NULL
            GROUP BY UPPER(TRIM(a.section))
            ORDER BY UPPER(TRIM(a.section)) ASC
        `, scope.params);

        const [schoolRows] = await recordsDb.query(`
            SELECT
                a.school_id,
                COALESCE(
                    NULLIF(TRIM(a.school_name), ''),
                    s.school_name,
                    'Unknown School'
                ) AS school_name,
                s.school_code,
                COUNT(DISTINCT a.id) AS total_students
            ${scope.sql}
            GROUP BY
                a.school_id,
                COALESCE(
                    NULLIF(TRIM(a.school_name), ''),
                    s.school_name,
                    'Unknown School'
                ),
                s.school_code
            ORDER BY school_name ASC
        `, scope.params);

        const bySection = {};
        for (const row of sectionRows) {
            const section = String(row.section || "").trim().toUpperCase();
            if (!section) continue;

            bySection[section] = {
                section,
                total_students: Number(row.total_students || 0),
                male_students: Number(row.male_students || 0),
                female_students: Number(row.female_students || 0),
                present_students: Number(row.present_students || 0),
                absent_students: Number(row.absent_students || 0)
            };
        }

        const sections = Object.values(bySection).sort(
            (a, b) => a.section.localeCompare(b.section, undefined, {
                numeric: true,
                sensitivity: "base"
            })
        );

        return {
            students: studentRows,
            sections,
            schools: schoolRows
        };
    }

    // --------------------------------------------------------
    // Drill-down students.
    // This does NOT change the main dashboard student scope.
    // --------------------------------------------------------
    static async getStudentRecordDetails(applicationId, filters = {}) {
        const id = Number(applicationId);

        if (!Number.isInteger(id) || id <= 0) {
            return null;
        }

        const scope = this.buildScope(filters);
        const params = [...scope.params, id];

        const [rows] = await recordsDb.query(`
            SELECT DISTINCT
                a.id,
                a.registration_no,
                a.full_name,
                a.father_name,
                a.mother_name,
                a.mobile,
                a.email,
                a.gender,
                a.dob,
                a.address,
                a.district,
                a.state,
                a.pincode,
                a.school_id,
                a.school_name,
                a.photo,
                a.class,
                a.section,
                a.roll_no,
                a.roll_number,
                a.status AS application_status,
                a.application_year,
                a.admit_generated,
                c.id AS centre_id,
                c.centre_code,
                c.centre_name,
                c.centre_type,
                ea.attendance_status,
                ea.scanned_at,
                a.room_no,
                ea.qr_token AS admit_qr_token,
                r.id AS result_id,
                r.marks,
                r.total_marks,
                r.total_full_marks,
                r.percentage,
                r.grade,
                r.section_rank,
                r.overall_rank,
                r.result_status,
                rrq.qr_token AS result_qr_token,
                cert.id AS certificate_id,
                cert.certificate_no,
                cert.certificate_type,
                cert.qr_code AS certificate_qr_code
            ${scope.sql.replace(
                "WHERE 1 = 1",
                `LEFT JOIN records_result_qr rrq
                ON rrq.application_year = a.application_year
                AND rrq.application_id = a.id
            LEFT JOIN records_certificates cert
                ON cert.application_year = a.application_year
                AND cert.application_id = a.id
            WHERE 1 = 1`
            )}
            AND a.id = ?
            LIMIT 1
        `, params);

        const student = rows[0] || null;

        if (!student) {
            return null;
        }

        let componentMarks = [];
        let rankingComponents = [];

        if (student.result_id) {
            const [componentRows] = await recordsDb.query(`
                SELECT
                    rcm.component_id,
                    rcm.marks,
                    mc.name,
                    mc.maximum_marks,
                    mc.enabled,
                    mc.grade_counting,
                    mc.ranking_enabled,
                    mc.display_order
                FROM records_result_component_marks rcm
                INNER JOIN records_mark_components mc
                    ON mc.application_year = ?
                    AND mc.id = rcm.component_id
                WHERE rcm.application_year = ?
                  AND rcm.result_id = ?
                  AND mc.enabled = 1
                ORDER BY mc.display_order ASC, mc.id ASC
            `, [
                student.application_year,
                student.application_year,
                student.result_id
            ]);

            componentMarks = componentRows;

            rankingComponents = componentRows.filter(
                component => Number(component.ranking_enabled) === 1
            );
        }

        const result = student.result_id
            ? {
                id: student.result_id,
                marks: student.marks,
                total_marks: student.total_marks,
                total_full_marks: student.total_full_marks,
                percentage: student.percentage,
                grade: student.grade,
                section_rank: student.section_rank,
                overall_rank: student.overall_rank,
                result_status: student.result_status,
                component_marks: componentMarks,
                ranking_components: rankingComponents,
                ranking_basis: rankingComponents.length
                    ? "OMR + confirmed marks combined"
                    : "OMR only"
            }
            : null;

        const certificate = student.certificate_id
            ? {
                id: student.certificate_id,
                certificate_no: student.certificate_no,
                certificate_type: student.certificate_type,
                qr_code: student.certificate_qr_code
            }
            : null;

        return {
            application: {
                id: student.id,
                registration_no: student.registration_no,
                full_name: student.full_name,
                father_name: student.father_name,
                mother_name: student.mother_name,
                mobile: student.mobile,
                email: student.email,
                gender: student.gender,
                dob: student.dob,
                address: student.address,
                district: student.district,
                state: student.state,
                pincode: student.pincode,
                school_id: student.school_id,
                school_name: student.school_name,
                photo: student.photo,
                class: student.class,
                section: student.section,
                roll_no: student.roll_no,
                roll_number: student.roll_number,
                application_status: student.application_status,
                application_year: student.application_year,
                admit_generated: student.admit_generated
            },
            centre: {
                id: student.centre_id,
                code: student.centre_code,
                name: student.centre_name,
                type: student.centre_type
            },
            attendance: {
                status: student.attendance_status,
                scanned_at: student.scanned_at,
                room_no: student.room_no,
                qr_token: student.admit_qr_token
            },
            result,
            result_qr_token: student.result_qr_token || null,
            certificate
        };
    }

    // --------------------------------------------------------
    // Historical exam setting for a Records application year.
    // --------------------------------------------------------
    static async getExamSetting(applicationYear) {
        const year = Number(applicationYear);

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            return null;
        }

        const [rows] = await recordsDb.query(`
            SELECT *
            FROM records_exam_settings
            WHERE application_year = ?
              AND exam_year = ?
            ORDER BY id DESC
            LIMIT 1
        `, [year, year]);

        return rows[0] || null;
    }

    // --------------------------------------------------------
    // Exact historical certificate lookup.
    // This is required because one application may have more
    // than one certificate in the historical snapshot.
    // --------------------------------------------------------
    static async getCertificate(
        applicationYear,
        applicationId,
        certificateType
    ) {
        const year = Number(applicationYear);
        const id = Number(applicationId);
        const type = String(certificateType || "").trim();

        if (
            !Number.isInteger(year) ||
            year < 2000 ||
            year > 2100 ||
            !Number.isInteger(id) ||
            id <= 0 ||
            !type
        ) {
            return null;
        }

        const [rows] = await recordsDb.query(`
            SELECT
                id,
                application_id,
                certificate_no,
                certificate_type,
                issue_date,
                qr_code,
                created_at
            FROM records_certificates
            WHERE application_year = ?
              AND application_id = ?
              AND certificate_type = ?
            ORDER BY id DESC
            LIMIT 1
        `, [year, id, type]);

        return rows[0] || null;
    }

    // --------------------------------------------------------
    // Historical certificate settings for a Records application year.
    // --------------------------------------------------------
    static async getCertificateSetting(applicationYear) {
        const year = Number(applicationYear);

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            return null;
        }

        const [rows] = await recordsDb.query(`
            SELECT *
            FROM records_certificate_settings
            WHERE application_year = ?
            LIMIT 1
        `, [year]);

        return rows[0] || null;
    }

    // --------------------------------------------------------
    // Historical certificate category setting for a Records year.
    // --------------------------------------------------------
    static async getCertificateCategorySetting(
        applicationYear,
        categoryKey
    ) {
        const year = Number(applicationYear);
        const key = String(categoryKey || "").trim();

        if (
            !Number.isInteger(year) ||
            year < 2000 ||
            year > 2100 ||
            !key
        ) {
            return null;
        }

        const [rows] = await recordsDb.query(`
            SELECT *
            FROM records_certificate_category_settings
            WHERE application_year = ?
              AND category_key = ?
            LIMIT 1
        `, [year, key]);

        return rows[0] || null;
    }

    // --------------------------------------------------------
    // All historical certificate category settings for a year.
    // --------------------------------------------------------
    static async getCertificateCategorySettings(applicationYear) {
        const year = Number(applicationYear);

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            return [];
        }

        const [rows] = await recordsDb.query(`
            SELECT *
            FROM records_certificate_category_settings
            WHERE application_year = ?
            ORDER BY id ASC
        `, [year]);

        return rows;
    }

    // --------------------------------------------------------
    // Historical examination shifts and sections.
    // --------------------------------------------------------
    static async getExamShifts(applicationYear, examSettingId = null) {
        const year = Number(applicationYear);

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            return [];
        }

        const params = [year];
        let sql = `
            SELECT
                es.id,
                es.exam_setting_id,
                es.shift_id,
                es.reporting_time,
                es.exam_start_time,
                es.exam_end_time,
                es.is_active,
                s.shift_no,
                s.shift_name,
                s.layout,
                s.is_active AS shift_master_active
            FROM records_exam_shifts es
            INNER JOIN records_seat_plan_shifts s
                ON s.application_year = es.application_year
                AND s.id = es.shift_id
            WHERE es.application_year = ?
        `;

        if (Number.isInteger(Number(examSettingId)) && Number(examSettingId) > 0) {
            sql += ` AND es.exam_setting_id = ?`;
            params.push(Number(examSettingId));
        }

        sql += `
            ORDER BY s.shift_no ASC, es.id ASC
        `;

        const [rows] = await recordsDb.query(sql, params);

        for (const shift of rows) {
            const [sections] = await recordsDb.query(`
                SELECT
                    id,
                    section
                FROM records_exam_shift_sections
                WHERE application_year = ?
                  AND exam_shift_id = ?
                ORDER BY section ASC
            `, [
                year,
                shift.id
            ]);

            shift.sections = sections;
        }

        return rows;
    }

    static async getDrilldownStudents(filters = {}) {
        const scope = this.buildScope(filters);
        const params = [...scope.params];

        let extra = "";

        const section = String(filters.section || "").trim().toUpperCase();
        if (section) {
            extra += ` AND UPPER(TRIM(a.section)) = ?`;
            params.push(section);
        }

        const schoolId = String(filters.schoolId || "").trim();
        if (/^\d+$/.test(schoolId)) {
            extra += ` AND a.school_id = ?`;
            params.push(Number(schoolId));
        }

        const attendance = String(filters.attendance || "").trim().toUpperCase();
        if (attendance === "PRESENT") {
            extra += ` AND ea.attendance_status = 'PRESENT'`;
        } else if (attendance === "ABSENT") {
            extra += `
                AND (
                    ea.attendance_status = 'ABSENT'
                    OR ea.attendance_status IS NULL
                    OR ea.attendance_status <> 'PRESENT'
                )
            `;
        }

        const [rows] = await recordsDb.query(`
            SELECT DISTINCT
                a.id,
                a.registration_no,
                a.full_name,
                a.father_name,
                a.gender,
                a.school_name,
                a.school_id,
                a.class,
                a.section,
                a.roll_no,
                a.roll_number,
                a.application_year,
                c.centre_code,
                c.centre_name,
                ea.attendance_status,
                ea.scanned_at,
                r.id AS result_id,
                r.marks,
                r.total_marks,
                r.total_full_marks,
                r.percentage,
                r.grade,
                r.result_status
            ${scope.sql}
            ${extra}
            ORDER BY
                UPPER(TRIM(a.section)) ASC,
                a.roll_no ASC,
                a.full_name ASC
        `, params);

        return rows;
    }
}

module.exports = RtseRecords;
