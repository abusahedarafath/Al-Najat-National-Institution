const db = require("../config/database");

const recordsDb = db.recordsPool;

const OP_DB = "al_najat_db";
const RECORDS_DB = "al_najat_records_db";

function normalizeYear(value) {
    const year = Number(value);

    if (!Number.isInteger(year) || year < 1900 || year > 2200) {
        throw new Error("Invalid application year.");
    }

    return year;
}

async function copyRows(connection, table, columns, selectSql, params = []) {
    const columnSql = columns.map(column => `\`${column}\``).join(", ");

    const updateSql = columns
        .filter(column => column !== "application_year" && column !== "id")
        .map(column => `\`${column}\`=VALUES(\`${column}\`)`)
        .join(", ");

    const sql = `
        INSERT INTO ${RECORDS_DB}.\`${table}\`
            (${columnSql})
        ${selectSql}
        ON DUPLICATE KEY UPDATE
            ${updateSql}
    `;

    await connection.query(sql, params);
}

class RtseRecordsYear {

    static async getYears() {
        const [rows] = await recordsDb.query(`
            SELECT
                y.application_year,
                COALESCE(r.exam_year, es.exam_year, y.application_year) AS exam_year,
                COALESCE(r.archive_status, 'ACTIVE') AS archive_status,
                r.archived_at,
                r.reopened_at,
                (
                    SELECT COUNT(*)
                    FROM ${OP_DB}.rtse_applications a
                    WHERE a.application_year = y.application_year
                ) AS operational_applications,
                (
                    SELECT COUNT(*)
                    FROM ${OP_DB}.rtse_exam_settings e
                    WHERE e.exam_year = y.application_year
                ) AS operational_exam_settings,
                (
                    SELECT COUNT(*)
                    FROM ${RECORDS_DB}.records_applications ra
                    WHERE ra.application_year = y.application_year
                ) AS record_applications,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM ${OP_DB}.rtse_exam_settings ae
                        WHERE ae.exam_year = y.application_year
                          AND ae.status = 'ACTIVE'
                    )
                    THEN 1 ELSE 0
                END AS is_active_operational_year
            FROM (
                SELECT application_year
                FROM ${RECORDS_DB}.records_archive_years

                UNION

                SELECT application_year
                FROM ${OP_DB}.rtse_applications

                UNION

                SELECT exam_year AS application_year
                FROM ${OP_DB}.rtse_exam_settings
            ) y
            LEFT JOIN ${RECORDS_DB}.records_archive_years r
                ON r.application_year = y.application_year
            LEFT JOIN (
                SELECT exam_year, MAX(id) AS id
                FROM ${OP_DB}.rtse_exam_settings
                GROUP BY exam_year
            ) latest_es
                ON latest_es.exam_year = y.application_year
            LEFT JOIN ${OP_DB}.rtse_exam_settings es
                ON es.id = latest_es.id
            ORDER BY y.application_year DESC
        `);

        return rows;
    }

    static async finishYear(applicationYear) {
        const year = normalizeYear(applicationYear);
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [[existing]] = await connection.query(`
                SELECT *
                FROM ${RECORDS_DB}.records_archive_years
                WHERE application_year = ?
                FOR UPDATE
            `, [year]);

            if (existing && ["ARCHIVED", "RETIRED"].includes(existing.archive_status)) {
                throw new Error(
                    `Year ${year} is already ${existing.archive_status.toLowerCase()}.`
                );
            }

            const [[sourceStats]] = await connection.query(`
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM ${OP_DB}.rtse_applications
                        WHERE application_year = ?
                    ) AS applications,
                    (
                        SELECT COUNT(*)
                        FROM ${OP_DB}.rtse_exam_settings
                        WHERE exam_year = ?
                    ) AS exam_settings
            `, [year, year]);

            if (Number(sourceStats.applications) === 0) {
                throw new Error(
                    `No operational application data exists for ${year}.`
                );
            }

            const [[examSetting]] = await connection.query(`
                SELECT id, exam_year
                FROM ${OP_DB}.rtse_exam_settings
                WHERE exam_year = ?
                ORDER BY id DESC
                LIMIT 1
            `, [year]);

            if (!examSetting) {
                throw new Error(
                    `No RTSE examination setting was found for ${year}.`
                );
            }

            const [[activeExam]] = await connection.query(`
            SELECT exam_year
            FROM ${OP_DB}.rtse_exam_settings
            WHERE status = 'ACTIVE'
            ORDER BY id DESC
            LIMIT 1
        `);

        if (!activeExam || Number(activeExam.exam_year) !== year) {
            throw new Error(
                `Year ${year} cannot be finished because it is not the active operational examination year.`
            );
        }

        await connection.query(`
                INSERT INTO ${RECORDS_DB}.records_archive_years
                    (
                        application_year,
                        exam_year,
                        archive_status,
                        archived_at,
                        reopened_at
                    )
                VALUES (?, ?, 'ARCHIVING', NULL, NULL)
                ON DUPLICATE KEY UPDATE
                    exam_year = VALUES(exam_year),
                    archive_status = 'ARCHIVING',
                    updated_at = CURRENT_TIMESTAMP
            `, [year, Number(examSetting.exam_year)]);

            /*
             * ----------------------------------------------------
             * Parent/reference data
             * ----------------------------------------------------
             */

            await copyRows(
                connection,
                "records_schools",
                [
                    "application_year",
                    "id",
                    "school_code",
                    "school_name",
                    "school_type",
                    "head_name",
                    "mobile",
                    "email",
                    "address",
                    "village",
                    "post_office",
                    "district",
                    "state",
                    "pincode",
                    "status",
                    "remarks",
                    "created_by",
                    "approved_by",
                    "approved_at",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        ?,
                        s.id,
                        s.school_code,
                        s.school_name,
                        s.school_type,
                        s.head_name,
                        s.mobile,
                        s.email,
                        s.address,
                        s.village,
                        s.post_office,
                        s.district,
                        s.state,
                        s.pincode,
                        s.status,
                        s.remarks,
                        s.created_by,
                        s.approved_by,
                        s.approved_at,
                        s.created_at,
                        s.updated_at
                    FROM ${OP_DB}.arsp_schools s
                    WHERE s.id IN (
                        SELECT school_id
                        FROM ${OP_DB}.rtse_applications
                        WHERE application_year = ?
                          AND school_id IS NOT NULL

                        UNION

                        SELECT school_id
                        FROM ${OP_DB}.rtse_school_centre_assignments
                        WHERE application_year = ?
                          AND school_id IS NOT NULL
                    )
                `,
                [year, year, year]
            );

            await copyRows(
                connection,
                "records_centres",
                [
                    "application_year",
                    "id",
                    "centre_id",
                    "centre_code",
                    "centre_name",
                    "centre_type",
                    "head_name",
                    "mobile",
                    "email",
                    "address",
                    "village",
                    "post_office",
                    "district",
                    "state",
                    "pincode",
                    "capacity",
                    "status",
                    "remarks",
                    "created_by",
                    "approved_by",
                    "approved_at",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        ?,
                        c.id,
                        c.centre_id,
                        c.centre_code,
                        c.centre_name,
                        c.centre_type,
                        c.head_name,
                        c.mobile,
                        c.email,
                        c.address,
                        c.village,
                        c.post_office,
                        c.district,
                        c.state,
                        c.pincode,
                        c.capacity,
                        c.status,
                        c.remarks,
                        c.created_by,
                        c.approved_by,
                        c.approved_at,
                        c.created_at,
                        c.updated_at
                    FROM ${OP_DB}.rtse_centres c
                    WHERE c.id IN (
                        SELECT centre_id
                        FROM ${OP_DB}.rtse_school_centre_assignments
                        WHERE application_year = ?
                          AND centre_id IS NOT NULL
                    )
                `,
                [year, year]
            );

            await copyRows(
                connection,
                "records_seat_plan_shifts",
                [
                    "application_year",
                    "id",
                    "shift_no",
                    "shift_name",
                    "is_active",
                    "created_at",
                    "updated_at",
                    "layout"
                ],
                `
                    SELECT DISTINCT
                        ?,
                        s.id,
                        s.shift_no,
                        s.shift_name,
                        s.is_active,
                        s.created_at,
                        s.updated_at,
                        s.layout
                    FROM ${OP_DB}.rtse_seat_plan_shifts s
                    WHERE s.id IN (
                        SELECT es.shift_id
                        FROM ${OP_DB}.rtse_exam_shifts es
                        JOIN ${OP_DB}.rtse_exam_settings ex
                            ON ex.id = es.exam_setting_id
                        WHERE ex.exam_year = ?

                        UNION

                        SELECT r.shift_id
                        FROM ${OP_DB}.rtse_seat_plan_rooms r
                        WHERE r.application_year = ?

                        UNION

                        SELECT a.shift_id
                        FROM ${OP_DB}.rtse_applications a
                        WHERE a.application_year = ?
                          AND a.shift_id IS NOT NULL
                    )
                `,
                [year, year, year, year]
            );

            /*
             * ----------------------------------------------------
             * Examination configuration
             * ----------------------------------------------------
             */

            await copyRows(
                connection,
                "records_exam_settings",
                [
                    "application_year",
                    "id",
                    "exam_name",
                    "exam_year",
                    "exam_date",
                    "reporting_time",
                    "exam_start_time",
                    "exam_end_time",
                    "result_publish_date",
                    "certificate_publish_date",
                    "application_start_date",
                    "application_end_date",
                    "exam_centre",
                    "controller_name",
                    "status",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        ?,
                        id,
                        exam_name,
                        exam_year,
                        exam_date,
                        reporting_time,
                        exam_start_time,
                        exam_end_time,
                        result_publish_date,
                        certificate_publish_date,
                        application_start_date,
                        application_end_date,
                        exam_centre,
                        controller_name,
                        status,
                        NULL,
                        NULL
                    FROM ${OP_DB}.rtse_exam_settings
                    WHERE exam_year = ?
                `,
                [year, year]
            );

            await copyRows(
                connection,
                "records_exam_shifts",
                [
                    "application_year",
                    "id",
                    "exam_setting_id",
                    "shift_id",
                    "reporting_time",
                    "exam_start_time",
                    "exam_end_time",
                    "is_active",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        ?,
                        es.id,
                        es.exam_setting_id,
                        es.shift_id,
                        es.reporting_time,
                        es.exam_start_time,
                        es.exam_end_time,
                        es.is_active,
                        es.created_at,
                        es.updated_at
                    FROM ${OP_DB}.rtse_exam_shifts es
                    JOIN ${OP_DB}.rtse_exam_settings ex
                        ON ex.id = es.exam_setting_id
                    WHERE ex.exam_year = ?
                `,
                [year, year]
            );

            await copyRows(
                connection,
                "records_exam_shift_sections",
                [
                    "application_year",
                    "id",
                    "exam_shift_id",
                    "section",
                    "created_at"
                ],
                `
                    SELECT
                        ?,
                        sec.id,
                        sec.exam_shift_id,
                        sec.section,
                        sec.created_at
                    FROM ${OP_DB}.rtse_exam_shift_sections sec
                    JOIN ${OP_DB}.rtse_exam_shifts es
                        ON es.id = sec.exam_shift_id
                    JOIN ${OP_DB}.rtse_exam_settings ex
                        ON ex.id = es.exam_setting_id
                    WHERE ex.exam_year = ?
                `,
                [year, year]
            );

            /*
             * ----------------------------------------------------
             * Seat plan
             * ----------------------------------------------------
             */

            await copyRows(
                connection,
                "records_seat_plan_rooms",
                [
                    "application_year",
                    "id",
                    "shift_id",
                    "room_no",
                    "is_active",
                    "seat_system",
                    "left_gender_lock",
                    "right_gender_lock",
                    "left_section_lock",
                    "right_section_lock",
                    "universal_gender_lock",
                    "universal_section_lock",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        ?,
                        id,
                        shift_id,
                        room_no,
                        is_active,
                        seat_system,
                        left_gender_lock,
                        right_gender_lock,
                        left_section_lock,
                        right_section_lock,
                        universal_gender_lock,
                        universal_section_lock,
                        created_at,
                        updated_at
                    FROM ${OP_DB}.rtse_seat_plan_rooms
                    WHERE application_year = ?
                `,
                [year, year]
            );

            await copyRows(
                connection,
                "records_seat_plan_seats",
                [
                    "application_year",
                    "id",
                    "shift_id",
                    "room_id",
                    "row_no",
                    "seat_no",
                    "position",
                    "section",
                    "gender",
                    "is_active",
                    "is_locked",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        ?,
                        s.id,
                        s.shift_id,
                        s.room_id,
                        s.row_no,
                        s.seat_no,
                        s.position,
                        s.section,
                        s.gender,
                        s.is_active,
                        s.is_locked,
                        s.created_at,
                        s.updated_at
                    FROM ${OP_DB}.rtse_seat_plan_seats s
                    JOIN ${OP_DB}.rtse_seat_plan_rooms r
                        ON r.id = s.room_id
                    WHERE r.application_year = ?
                `,
                [year, year]
            );

            /*
             * ----------------------------------------------------
             * Applications and school-centre assignments
             * ----------------------------------------------------
             */

            await copyRows(
                connection,
                "records_applications",
                [
                    "application_year",
                    "id",
                    "registration_no",
                    "full_name",
                    "father_name",
                    "mother_name",
                    "gender",
                    "dob",
                    "mobile",
                    "email",
                    "school_name",
                    "school_id",
                    "district",
                    "state",
                    "class",
                    "section",
                    "shift_id",
                    "room_id",
                    "seat_id",
                    "photo",
                    "identity_document",
                    "status",
                    "roll_no",
                    "roll_number",
                    "admit_generated",
                    "omr_generated",
                    "created_at",
                    "room_no",
                    "seat_no",
                    "pincode",
                    "address"
                ],
                `
                    SELECT
                        application_year,
                        id,
                        registration_no,
                        full_name,
                        father_name,
                        mother_name,
                        gender,
                        dob,
                        mobile,
                        email,
                        school_name,
                        school_id,
                        district,
                        state,
                        class,
                        section,
                        shift_id,
                        room_id,
                        seat_id,
                        photo,
                        identity_document,
                        status,
                        roll_no,
                        roll_number,
                        admit_generated,
                        omr_generated,
                        created_at,
                        room_no,
                        seat_no,
                        pincode,
                        address
                    FROM ${OP_DB}.rtse_applications
                    WHERE application_year = ?
                `,
                [year]
            );

            await copyRows(
                connection,
                "records_school_centre_assignments",
                [
                    "application_year",
                    "id",
                    "school_id",
                    "centre_id",
                    "status",
                    "assigned_by",
                    "approved_by",
                    "approved_at",
                    "remarks",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        application_year,
                        id,
                        school_id,
                        centre_id,
                        status,
                        assigned_by,
                        approved_by,
                        approved_at,
                        remarks,
                        created_at,
                        updated_at
                    FROM ${OP_DB}.rtse_school_centre_assignments
                    WHERE application_year = ?
                `,
                [year]
            );

            /*
             * ----------------------------------------------------
             * Attendance
             * ----------------------------------------------------
             */

            await copyRows(
                connection,
                "records_exam_attendance",
                [
                    "application_year",
                    "id",
                    "application_id",
                    "qr_token",
                    "attendance_status",
                    "scanned_at",
                    "scanned_by_user_id",
                    "scanned_by_username",
                    "scanned_by_role",
                    "created_at"
                ],
                `
                    SELECT
                        ?,
                        ea.id,
                        ea.application_id,
                        ea.qr_token,
                        ea.attendance_status,
                        ea.scanned_at,
                        ea.scanned_by,
                        NULL,
                        NULL,
                        ea.created_at
                    FROM ${OP_DB}.rtse_exam_attendance ea
                    JOIN ${OP_DB}.rtse_applications a
                        ON a.id = ea.application_id
                    WHERE a.application_year = ?
                `,
                [year, year]
            );

            await copyRows(
                connection,
                "records_exam_attendance_qr_history",
                [
                    "application_year",
                    "id",
                    "application_id",
                    "qr_token",
                    "created_at"
                ],
                `
                    SELECT
                        ?,
                        h.id,
                        h.application_id,
                        h.qr_token,
                        h.created_at
                    FROM ${OP_DB}.rtse_exam_attendance_qr_history h
                    JOIN ${OP_DB}.rtse_applications a
                        ON a.id = h.application_id
                    WHERE a.application_year = ?
                `,
                [year, year]
            );

            /*
             * ----------------------------------------------------
             * Results
             * ----------------------------------------------------
             */

            await copyRows(
                connection,
                "records_mark_components",
                [
                    "application_year",
                    "id",
                    "name",
                    "maximum_marks",
                    "enabled",
                    "grade_counting",
                    "ranking_enabled",
                    "display_order",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        application_year,
                        id,
                        name,
                        maximum_marks,
                        enabled,
                        grade_counting,
                        ranking_enabled,
                        display_order,
                        created_at,
                        updated_at
                    FROM ${OP_DB}.rtse_mark_components
                    WHERE application_year = ?
                `,
                [year]
            );

            await copyRows(
                connection,
                "records_results",
                [
                    "application_year",
                    "id",
                    "application_id",
                    "marks",
                    "total_marks",
                    "total_full_marks",
                    "percentage",
                    "grade",
                    "rank_no",
                    "result_status",
                    "created_at",
                    "section_rank",
                    "overall_rank"
                ],
                `
                    SELECT
                        ?,
                        r.id,
                        r.application_id,
                        r.marks,
                        r.total_marks,
                        r.total_full_marks,
                        r.percentage,
                        r.grade,
                        r.rank_no,
                        r.result_status,
                        r.created_at,
                        r.section_rank,
                        r.overall_rank
                    FROM ${OP_DB}.rtse_results r
                    JOIN ${OP_DB}.rtse_applications a
                        ON a.id = r.application_id
                    WHERE a.application_year = ?
                `,
                [year, year]
            );

            await copyRows(
                connection,
                "records_result_component_marks",
                [
                    "application_year",
                    "id",
                    "result_id",
                    "component_id",
                    "marks",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        ?,
                        cm.id,
                        cm.result_id,
                        cm.component_id,
                        cm.marks,
                        cm.created_at,
                        cm.updated_at
                    FROM ${OP_DB}.rtse_result_component_marks cm
                    JOIN ${OP_DB}.rtse_results r
                        ON r.id = cm.result_id
                    JOIN ${OP_DB}.rtse_applications a
                        ON a.id = r.application_id
                    WHERE a.application_year = ?
                `,
                [year, year]
            );

            await copyRows(
                connection,
                "records_result_qr",
                [
                    "application_year",
                    "id",
                    "application_id",
                    "qr_token",
                    "created_at"
                ],
                `
                    SELECT
                        ?,
                        q.id,
                        q.application_id,
                        q.qr_token,
                        q.created_at
                    FROM ${OP_DB}.rtse_result_qr q
                    JOIN ${OP_DB}.rtse_applications a
                        ON a.id = q.application_id
                    WHERE a.application_year = ?
                `,
                [year, year]
            );

            /*
             * ----------------------------------------------------
             * Certificates
             * ----------------------------------------------------
             */

            await copyRows(
                connection,
                "records_certificates",
                [
                    "application_year",
                    "id",
                    "application_id",
                    "certificate_no",
                    "certificate_type",
                    "issue_date",
                    "qr_code",
                    "created_at"
                ],
                `
                    SELECT
                        ?,
                        c.id,
                        c.application_id,
                        c.certificate_no,
                        c.certificate_type,
                        c.issue_date,
                        c.qr_code,
                        c.created_at
                    FROM ${OP_DB}.rtse_certificates c
                    JOIN ${OP_DB}.rtse_applications a
                        ON a.id = c.application_id
                    WHERE a.application_year = ?
                `,
                [year, year]
            );

            const [[certificateSettingsCount]] = await connection.query(`
                SELECT COUNT(*) AS total
                FROM ${OP_DB}.rtse_certificate_settings
            `);

            if (Number(certificateSettingsCount.total) > 1) {
                throw new Error(
                    "More than one rtse_certificate_settings row exists. " +
                    "The historical certificate settings snapshot cannot safely choose one."
                );
            }

            await copyRows(
                connection,
                "records_certificate_settings",
                [
                    "application_year",
                    "id",
                    "exam_name",
                    "organized_by",
                    "organized_by_label",
                    "left_signature",
                    "left_signature_label",
                    "right_signature",
                    "right_signature_label",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        ?,
                        id,
                        exam_name,
                        organized_by,
                        organized_by_label,
                        left_signature,
                        left_signature_label,
                        right_signature,
                        right_signature_label,
                        created_at,
                        updated_at
                    FROM ${OP_DB}.rtse_certificate_settings
                `,
                [year]
            );

            await copyRows(
                connection,
                "records_certificate_category_settings",
                [
                    "application_year",
                    "id",
                    "category_key",
                    "certificate_name",
                    "certificate_description",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        ?,
                        id,
                        category_key,
                        certificate_name,
                        certificate_description,
                        created_at,
                        updated_at
                    FROM ${OP_DB}.rtse_certificate_category_settings
                `,
                [year]
            );

            /*
             * ----------------------------------------------------
             * OMR / login PDFs / admit download history
             * ----------------------------------------------------
             */

            await copyRows(
                connection,
                "records_counted_omr",
                [
                    "application_year",
                    "id",
                    "application_id",
                    "file_name",
                    "original_name",
                    "mime_type",
                    "file_size",
                    "created_at",
                    "updated_at"
                ],
                `
                    SELECT
                        ?,
                        o.id,
                        o.application_id,
                        o.file_name,
                        o.original_name,
                        o.mime_type,
                        o.file_size,
                        o.created_at,
                        o.updated_at
                    FROM ${OP_DB}.rtse_counted_omr o
                    JOIN ${OP_DB}.rtse_applications a
                        ON a.id = o.application_id
                    WHERE a.application_year = ?
                `,
                [year, year]
            );

            await copyRows(
                connection,
                "records_login_information_pdfs",
                [
                    "application_year",
                    "id",
                    "application_id",
                    "file_name",
                    "file_path",
                    "prepared_at"
                ],
                `
                    SELECT
                        ?,
                        p.id,
                        p.application_id,
                        p.file_name,
                        p.file_path,
                        p.prepared_at
                    FROM ${OP_DB}.rtse_login_information_pdfs p
                    JOIN ${OP_DB}.rtse_applications a
                        ON a.id = p.application_id
                    WHERE a.application_year = ?
                `,
                [year, year]
            );

            await copyRows(
                connection,
                "records_admit_downloads",
                [
                    "application_year",
                    "id",
                    "application_id",
                    "registration_no",
                    "student_name",
                    "google_subject",
                    "google_email",
                    "google_name",
                    "downloader_name",
                    "mobile",
                    "mobile_verified",
                    "otp_provider",
                    "otp_request_id",
                    "verified_at",
                    "downloaded_at",
                    "ip_address",
                    "user_agent"
                ],
                `
                    SELECT
                        ?,
                        d.id,
                        d.application_id,
                        d.registration_no,
                        d.student_name,
                        d.google_subject,
                        d.google_email,
                        d.google_name,
                        d.downloader_name,
                        d.mobile,
                        d.mobile_verified,
                        d.otp_provider,
                        d.otp_request_id,
                        d.verified_at,
                        d.downloaded_at,
                        d.ip_address,
                        d.user_agent
                    FROM ${OP_DB}.rtse_admit_downloads d
                    JOIN ${OP_DB}.rtse_applications a
                        ON a.id = d.application_id
                    WHERE a.application_year = ?
                `,
                [year, year]
            );

            /*
             * ----------------------------------------------------
             * Verification
             * ----------------------------------------------------
             */

            const checks = [
                ["applications", "rtse_applications", "records_applications", "application_year"],
                ["schools", "arsp_schools", "records_schools", "application_year"],
                ["centres", "rtse_centres", "records_centres", "application_year"],
                ["rooms", "rtse_seat_plan_rooms", "records_seat_plan_rooms", "application_year"],
                ["seats", "rtse_seat_plan_seats", "records_seat_plan_seats", "application_year"],
                ["assignments", "rtse_school_centre_assignments", "records_school_centre_assignments", "application_year"],
                ["attendance", "rtse_exam_attendance", "records_exam_attendance", "application_year"],
                ["attendance_qr_history", "rtse_exam_attendance_qr_history", "records_exam_attendance_qr_history", "application_year"],
                ["mark_components", "rtse_mark_components", "records_mark_components", "application_year"],
                ["results", "rtse_results", "records_results", "application_year"],
                ["result_component_marks", "rtse_result_component_marks", "records_result_component_marks", "application_year"],
                ["result_qr", "rtse_result_qr", "records_result_qr", "application_year"],
                ["certificates", "rtse_certificates", "records_certificates", "application_year"],
                ["counted_omr", "rtse_counted_omr", "records_counted_omr", "application_year"],
                ["login_information_pdfs", "rtse_login_information_pdfs", "records_login_information_pdfs", "application_year"],
                ["admit_downloads", "rtse_admit_downloads", "records_admit_downloads", "application_year"]
            ];

            for (const [label, sourceTable, destinationTable] of checks) {
                let sourceWhere = "";
                let sourceParams = [year];

                if (
                    sourceTable === "rtse_results" ||
                    sourceTable === "rtse_exam_attendance" ||
                    sourceTable === "rtse_exam_attendance_qr_history" ||
                    sourceTable === "rtse_result_component_marks" ||
                    sourceTable === "rtse_result_qr" ||
                    sourceTable === "rtse_certificates" ||
                    sourceTable === "rtse_counted_omr" ||
                    sourceTable === "rtse_login_information_pdfs" ||
                    sourceTable === "rtse_admit_downloads"
                ) {
                    const appColumn = {
                        rtse_results: "application_id",
                        rtse_exam_attendance: "application_id",
                        rtse_exam_attendance_qr_history: "application_id",
                        rtse_result_component_marks: "result_id",
                        rtse_result_qr: "application_id",
                        rtse_certificates: "application_id",
                        rtse_counted_omr: "application_id",
                        rtse_login_information_pdfs: "application_id",
                        rtse_admit_downloads: "application_id"
                    }[sourceTable];

                    if (sourceTable === "rtse_result_component_marks") {
                        sourceWhere = `
                            WHERE EXISTS (
                                SELECT 1
                                FROM ${OP_DB}.rtse_results r
                                JOIN ${OP_DB}.rtse_applications a
                                    ON a.id = r.application_id
                                WHERE r.id = cm.result_id
                                  AND a.application_year = ?
                            )
                        `;
                    } else {
                        sourceWhere = `
                            WHERE EXISTS (
                                SELECT 1
                                FROM ${OP_DB}.rtse_applications a
                                WHERE a.id = ${sourceTable === "rtse_results" ? "r" : "x"}.${appColumn}
                                  AND a.application_year = ?
                            )
                        `;
                    }
                }

                let sourceSql;
                let destinationSql;

                if (sourceTable === "rtse_results") {
                    sourceSql = `
                        SELECT COUNT(*) AS total
                        FROM ${OP_DB}.rtse_results r
                        JOIN ${OP_DB}.rtse_applications a
                            ON a.id = r.application_id
                        WHERE a.application_year = ?
                    `;
                } else if (sourceTable === "rtse_result_component_marks") {
                    sourceSql = `
                        SELECT COUNT(*) AS total
                        FROM ${OP_DB}.rtse_result_component_marks cm
                        JOIN ${OP_DB}.rtse_results r
                            ON r.id = cm.result_id
                        JOIN ${OP_DB}.rtse_applications a
                            ON a.id = r.application_id
                        WHERE a.application_year = ?
                    `;
                } else if (
                    [
                        "rtse_exam_attendance",
                        "rtse_exam_attendance_qr_history",
                        "rtse_result_qr",
                        "rtse_certificates",
                        "rtse_counted_omr",
                        "rtse_login_information_pdfs",
                        "rtse_admit_downloads"
                    ].includes(sourceTable)
                ) {
                    sourceSql = `
                        SELECT COUNT(*) AS total
                        FROM ${OP_DB}.${sourceTable} x
                        JOIN ${OP_DB}.rtse_applications a
                            ON a.id = x.application_id
                        WHERE a.application_year = ?
                    `;
                } else if (sourceTable === "arsp_schools") {
                    sourceSql = `
                        SELECT COUNT(DISTINCT s.id) AS total
                        FROM ${OP_DB}.arsp_schools s
                        WHERE s.id IN (
                            SELECT school_id
                            FROM ${OP_DB}.rtse_applications
                            WHERE application_year = ?
                              AND school_id IS NOT NULL

                            UNION

                            SELECT school_id
                            FROM ${OP_DB}.rtse_school_centre_assignments
                            WHERE application_year = ?
                              AND school_id IS NOT NULL
                        )
                    `;
                    sourceParams = [year, year];
                } else if (sourceTable === "rtse_centres") {
                    sourceSql = `
                        SELECT COUNT(DISTINCT c.id) AS total
                        FROM ${OP_DB}.rtse_centres c
                        WHERE c.id IN (
                            SELECT centre_id
                            FROM ${OP_DB}.rtse_school_centre_assignments
                            WHERE application_year = ?
                              AND centre_id IS NOT NULL
                        )
                    `;
                } else if (sourceTable === "rtse_seat_plan_seats") {
                    sourceSql = `
                        SELECT COUNT(*) AS total
                        FROM ${OP_DB}.rtse_seat_plan_seats s
                        JOIN ${OP_DB}.rtse_seat_plan_rooms r
                            ON r.id = s.room_id
                        WHERE r.application_year = ?
                    `;
                } else {
                    sourceSql = `
                        SELECT COUNT(*) AS total
                        FROM ${OP_DB}.${sourceTable}
                        WHERE application_year = ?
                    `;
                }

                destinationSql = `
                    SELECT COUNT(*) AS total
                    FROM ${RECORDS_DB}.${destinationTable}
                    WHERE application_year = ?
                `;

                const [[src]] = await connection.query(sourceSql, sourceParams);
                const [[dst]] = await connection.query(destinationSql, [year]);

                if (Number(dst.total) !== Number(src.total)) {
                    throw new Error(
                        `Verification failed for ${label}: ` +
                        `source=${src.total}, records=${dst.total}.`
                    );
                }
            }

            /*
             * Required relationship verification.
             */

            const relationshipChecks = [
                [`
                    SELECT COUNT(*) AS bad
                    FROM ${RECORDS_DB}.records_applications a
                    LEFT JOIN ${RECORDS_DB}.records_schools s
                        ON s.application_year = a.application_year
                       AND s.id = a.school_id
                    WHERE a.application_year = ?
                      AND a.school_id IS NOT NULL
                      AND s.id IS NULL
                `, "application -> school"],

                [`
                    SELECT COUNT(*) AS bad
                    FROM ${RECORDS_DB}.records_applications a
                    LEFT JOIN ${RECORDS_DB}.records_seat_plan_shifts s
                        ON s.application_year = a.application_year
                       AND s.id = a.shift_id
                    WHERE a.application_year = ?
                      AND a.shift_id IS NOT NULL
                      AND s.id IS NULL
                `, "application -> shift"],

                [`
                    SELECT COUNT(*) AS bad
                    FROM ${RECORDS_DB}.records_applications a
                    LEFT JOIN ${RECORDS_DB}.records_seat_plan_rooms r
                        ON r.application_year = a.application_year
                       AND r.id = a.room_id
                    WHERE a.application_year = ?
                      AND a.room_id IS NOT NULL
                      AND r.id IS NULL
                `, "application -> room"],

                [`
                    SELECT COUNT(*) AS bad
                    FROM ${RECORDS_DB}.records_applications a
                    LEFT JOIN ${RECORDS_DB}.records_seat_plan_seats s
                        ON s.application_year = a.application_year
                       AND s.id = a.seat_id
                    WHERE a.application_year = ?
                      AND a.seat_id IS NOT NULL
                      AND s.id IS NULL
                `, "application -> seat"],

                [`
                    SELECT COUNT(*) AS bad
                    FROM ${RECORDS_DB}.records_exam_attendance ea
                    LEFT JOIN ${RECORDS_DB}.records_applications a
                        ON a.application_year = ea.application_year
                       AND a.id = ea.application_id
                    WHERE ea.application_year = ?
                      AND a.id IS NULL
                `, "attendance -> application"],

                [`
                    SELECT COUNT(*) AS bad
                    FROM ${RECORDS_DB}.records_results r
                    LEFT JOIN ${RECORDS_DB}.records_applications a
                        ON a.application_year = r.application_year
                       AND a.id = r.application_id
                    WHERE r.application_year = ?
                      AND a.id IS NULL
                `, "result -> application"],

                [`
                    SELECT COUNT(*) AS bad
                    FROM ${RECORDS_DB}.records_certificates c
                    LEFT JOIN ${RECORDS_DB}.records_applications a
                        ON a.application_year = c.application_year
                       AND a.id = c.application_id
                    WHERE c.application_year = ?
                      AND a.id IS NULL
                `, "certificate -> application"]
            ];

            for (const [sql, label] of relationshipChecks) {
                const [[result]] = await connection.query(sql, [year]);

                if (Number(result.bad) !== 0) {
                    throw new Error(
                        `Relationship verification failed: ${label}.`
                    );
                }
            }

            /*
             * TRUE MOVE:
             * The year-specific operational data is now removed only after
             * successful Records DB copy + verification.
             *
             * Shared operational configuration is intentionally retained:
             * rtse_exam_settings, rtse_exam_shifts,
             * rtse_exam_shift_sections, rtse_seat_plan_shifts,
             * schools, centres and certificate master settings.
             *
             * Physical files are never touched.
             */

            await connection.query(`
                DELETE d
                FROM ${OP_DB}.rtse_admit_downloads d
                INNER JOIN ${OP_DB}.rtse_applications a
                    ON a.id = d.application_id
                WHERE a.application_year = ?
            `, [year]);

            await connection.query(`
                DELETE p
                FROM ${OP_DB}.rtse_login_information_pdfs p
                INNER JOIN ${OP_DB}.rtse_applications a
                    ON a.id = p.application_id
                WHERE a.application_year = ?
            `, [year]);

            await connection.query(`
                DELETE o
                FROM ${OP_DB}.rtse_counted_omr o
                INNER JOIN ${OP_DB}.rtse_applications a
                    ON a.id = o.application_id
                WHERE a.application_year = ?
            `, [year]);

            await connection.query(`
                DELETE c
                FROM ${OP_DB}.rtse_certificates c
                INNER JOIN ${OP_DB}.rtse_applications a
                    ON a.id = c.application_id
                WHERE a.application_year = ?
            `, [year]);

            await connection.query(`
                DELETE q
                FROM ${OP_DB}.rtse_result_qr q
                INNER JOIN ${OP_DB}.rtse_applications a
                    ON a.id = q.application_id
                WHERE a.application_year = ?
            `, [year]);

            await connection.query(`
                DELETE m
                FROM ${OP_DB}.rtse_result_component_marks m
                INNER JOIN ${OP_DB}.rtse_results r
                    ON r.id = m.result_id
                INNER JOIN ${OP_DB}.rtse_applications a
                    ON a.id = r.application_id
                WHERE a.application_year = ?
            `, [year]);

            await connection.query(`
                DELETE r
                FROM ${OP_DB}.rtse_results r
                INNER JOIN ${OP_DB}.rtse_applications a
                    ON a.id = r.application_id
                WHERE a.application_year = ?
            `, [year]);

            await connection.query(`
                DELETE q
                FROM ${OP_DB}.rtse_exam_attendance_qr_history q
                INNER JOIN ${OP_DB}.rtse_applications a
                    ON a.id = q.application_id
                WHERE a.application_year = ?
            `, [year]);

            await connection.query(`
                DELETE e
                FROM ${OP_DB}.rtse_exam_attendance e
                INNER JOIN ${OP_DB}.rtse_applications a
                    ON a.id = e.application_id
                WHERE a.application_year = ?
            `, [year]);

            await connection.query(`
                DELETE FROM ${OP_DB}.rtse_school_centre_assignments
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                DELETE FROM ${OP_DB}.rtse_mark_components
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                DELETE s
                FROM ${OP_DB}.rtse_seat_plan_seats s
                INNER JOIN ${OP_DB}.rtse_seat_plan_rooms r
                    ON r.id = s.room_id
                WHERE r.application_year = ?
            `, [year]);

            await connection.query(`
                DELETE FROM ${OP_DB}.rtse_seat_plan_rooms
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                DELETE FROM ${OP_DB}.rtse_applications
                WHERE application_year = ?
            `, [year]);

            /*
             * Final operational cleanup verification.
             * If anything year-specific remains, the transaction is rolled back.
             */
            const cleanupChecks = [
                [`SELECT COUNT(*) AS total FROM ${OP_DB}.rtse_applications WHERE application_year = ?`, "applications"],
                [`SELECT COUNT(*) AS total FROM ${OP_DB}.rtse_school_centre_assignments WHERE application_year = ?`, "school-centre assignments"],
                [`SELECT COUNT(*) AS total FROM ${OP_DB}.rtse_seat_plan_rooms WHERE application_year = ?`, "seat-plan rooms"],
                [`SELECT COUNT(*) AS total
                  FROM ${OP_DB}.rtse_seat_plan_seats s
                  WHERE EXISTS (
                      SELECT 1
                      FROM ${OP_DB}.rtse_seat_plan_rooms r
                      WHERE r.id = s.room_id
                        AND r.application_year = ?
                  )`, "seat-plan seats"],
                [`SELECT COUNT(*) AS total FROM ${OP_DB}.rtse_exam_attendance e
                  INNER JOIN ${OP_DB}.rtse_applications a ON a.id = e.application_id
                  WHERE a.application_year = ?`, "attendance"],
                [`SELECT COUNT(*) AS total FROM ${OP_DB}.rtse_results r
                  INNER JOIN ${OP_DB}.rtse_applications a ON a.id = r.application_id
                  WHERE a.application_year = ?`, "results"],
                [`SELECT COUNT(*) AS total FROM ${OP_DB}.rtse_certificates c
                  INNER JOIN ${OP_DB}.rtse_applications a ON a.id = c.application_id
                  WHERE a.application_year = ?`, "certificates"],
                [`SELECT COUNT(*) AS total FROM ${OP_DB}.rtse_counted_omr o
                  INNER JOIN ${OP_DB}.rtse_applications a ON a.id = o.application_id
                  WHERE a.application_year = ?`, "counted OMR"],
                [`SELECT COUNT(*) AS total FROM ${OP_DB}.rtse_login_information_pdfs p
                  INNER JOIN ${OP_DB}.rtse_applications a ON a.id = p.application_id
                  WHERE a.application_year = ?`, "login information PDFs"],
                [`SELECT COUNT(*) AS total FROM ${OP_DB}.rtse_admit_downloads d
                  INNER JOIN ${OP_DB}.rtse_applications a ON a.id = d.application_id
                  WHERE a.application_year = ?`, "admit downloads"],
                [`SELECT COUNT(*) AS total FROM ${OP_DB}.rtse_mark_components WHERE application_year = ?`, "mark components"]
            ];

            for (const [sql, label] of cleanupChecks) {
                const [[check]] = await connection.query(sql, [year]);

                if (Number(check.total) !== 0) {
                    throw new Error(
                        `Operational cleanup verification failed: ${label}=${check.total}.`
                    );
                }
            }

            await connection.query(`
                UPDATE ${RECORDS_DB}.records_archive_years
                SET
                    archive_status = 'ARCHIVED',
                    archived_at = CURRENT_TIMESTAMP,
                    reopened_at = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE application_year = ?
            `, [year]);

            await connection.commit();

            const [[result]] = await recordsDb.query(`
                SELECT *
                FROM ${RECORDS_DB}.records_archive_years
                WHERE application_year = ?
            `, [year]);

            return result;

        } catch (error) {
            try {
                await connection.rollback();
            } catch (_) {}

            throw error;
        } finally {
            connection.release();
        }
    }

    static async reopenYear(applicationYear) {
        const year = normalizeYear(applicationYear);
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [[archive]] = await connection.query(`
                SELECT *
                FROM ${RECORDS_DB}.records_archive_years
                WHERE application_year = ?
                FOR UPDATE
            `, [year]);

            if (!archive) {
                throw new Error(
                    `No Records DB archive exists for ${year}.`
                );
            }

            if (archive.archive_status !== "ARCHIVED") {
                throw new Error(
                    `Year ${year} cannot be reopened from status ${archive.archive_status}.`
                );
            }

            const [[activeExam]] = await connection.query(`
                SELECT exam_year
                FROM ${OP_DB}.rtse_exam_settings
                WHERE status = 'ACTIVE'
                ORDER BY id DESC
                LIMIT 1
            `);

            if (
                !activeExam ||
                Number(activeExam.exam_year) !== year
            ) {
                throw new Error(
                    `Year ${year} cannot be reopened because it is not the active operational examination year.`
                );
            }

            /*
             * The target operational year must be completely empty
             * before restoration. This prevents duplicate/partial
             * restoration.
             */
            const emptyChecks = [
                [
                    "mark_components",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_mark_components
                     WHERE application_year = ?`
                ],
                [
                    "rooms",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_seat_plan_rooms
                     WHERE application_year = ?`
                ],
                [
                    "seats",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_seat_plan_seats s
                     JOIN ${OP_DB}.rtse_seat_plan_rooms r
                       ON r.id = s.room_id
                     WHERE r.application_year = ?`
                ],
                [
                    "assignments",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_school_centre_assignments
                     WHERE application_year = ?`
                ],
                [
                    "applications",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_applications
                     WHERE application_year = ?`
                ],
                [
                    "attendance",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_exam_attendance ea
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = ea.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "attendance_qr_history",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_exam_attendance_qr_history h
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = h.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "results",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_results r
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = r.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "result_component_marks",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_result_component_marks cm
                     JOIN ${OP_DB}.rtse_results r
                       ON r.id = cm.result_id
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = r.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "result_qr",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_result_qr q
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = q.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "certificates",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_certificates c
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = c.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "counted_omr",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_counted_omr o
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = o.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "login_information_pdfs",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_login_information_pdfs p
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = p.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "admit_downloads",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_admit_downloads d
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = d.application_id
                     WHERE a.application_year = ?`
                ]
            ];

            for (const [label, sql] of emptyChecks) {
                const [[row]] = await connection.query(sql, [year]);

                if (Number(row.total) !== 0) {
                    throw new Error(
                        `Cannot reopen ${year}: operational ${label} table is not empty.`
                    );
                }
            }

            /*
             * Capture source counts before restoration.
             */
            const sourceChecks = [
                [
                    "mark_components",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_mark_components
                     WHERE application_year = ?`
                ],
                [
                    "rooms",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_seat_plan_rooms
                     WHERE application_year = ?`
                ],
                [
                    "seats",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_seat_plan_seats
                     WHERE application_year = ?`
                ],
                [
                    "assignments",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_school_centre_assignments
                     WHERE application_year = ?`
                ],
                [
                    "applications",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_applications
                     WHERE application_year = ?`
                ],
                [
                    "attendance",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_exam_attendance
                     WHERE application_year = ?`
                ],
                [
                    "attendance_qr_history",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_exam_attendance_qr_history
                     WHERE application_year = ?`
                ],
                [
                    "results",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_results
                     WHERE application_year = ?`
                ],
                [
                    "result_component_marks",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_result_component_marks
                     WHERE application_year = ?`
                ],
                [
                    "result_qr",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_result_qr
                     WHERE application_year = ?`
                ],
                [
                    "certificates",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_certificates
                     WHERE application_year = ?`
                ],
                [
                    "counted_omr",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_counted_omr
                     WHERE application_year = ?`
                ],
                [
                    "login_information_pdfs",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_login_information_pdfs
                     WHERE application_year = ?`
                ],
                [
                    "admit_downloads",
                    `SELECT COUNT(*) AS total
                     FROM ${RECORDS_DB}.records_admit_downloads
                     WHERE application_year = ?`
                ]
            ];

            const sourceCounts = {};

            for (const [label, sql] of sourceChecks) {
                const [[row]] = await connection.query(sql, [year]);
                sourceCounts[label] = Number(row.total);
            }

            /*
             * ----------------------------------------------------
             * RESTORE: Records DB -> Operational DB
             * ----------------------------------------------------
             */

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_mark_components
                (
                    id,
                    application_year,
                    name,
                    maximum_marks,
                    enabled,
                    grade_counting,
                    ranking_enabled,
                    display_order,
                    created_at,
                    updated_at
                )
                SELECT
                    id,
                    application_year,
                    name,
                    maximum_marks,
                    enabled,
                    grade_counting,
                    ranking_enabled,
                    display_order,
                    created_at,
                    updated_at
                FROM ${RECORDS_DB}.records_mark_components
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_seat_plan_rooms
                (
                    id,
                    shift_id,
                    application_year,
                    room_no,
                    is_active,
                    seat_system,
                    left_gender_lock,
                    right_gender_lock,
                    left_section_lock,
                    right_section_lock,
                    universal_gender_lock,
                    universal_section_lock,
                    created_at,
                    updated_at
                )
                SELECT
                    id,
                    shift_id,
                    application_year,
                    room_no,
                    is_active,
                    seat_system,
                    left_gender_lock,
                    right_gender_lock,
                    left_section_lock,
                    right_section_lock,
                    universal_gender_lock,
                    universal_section_lock,
                    created_at,
                    updated_at
                FROM ${RECORDS_DB}.records_seat_plan_rooms
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_seat_plan_seats
                (
                    id,
                    shift_id,
                    room_id,
                    row_no,
                    seat_no,
                    position,
                    section,
                    gender,
                    is_active,
                    is_locked,
                    created_at,
                    updated_at
                )
                SELECT
                    id,
                    shift_id,
                    room_id,
                    row_no,
                    seat_no,
                    position,
                    section,
                    gender,
                    is_active,
                    is_locked,
                    created_at,
                    updated_at
                FROM ${RECORDS_DB}.records_seat_plan_seats
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_school_centre_assignments
                (
                    id,
                    school_id,
                    centre_id,
                    application_year,
                    status,
                    assigned_by,
                    approved_by,
                    approved_at,
                    remarks,
                    created_at,
                    updated_at
                )
                SELECT
                    id,
                    school_id,
                    centre_id,
                    application_year,
                    status,
                    assigned_by,
                    approved_by,
                    approved_at,
                    remarks,
                    created_at,
                    updated_at
                FROM ${RECORDS_DB}.records_school_centre_assignments
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_applications
                (
                    id,
                    registration_no,
                    application_year,
                    full_name,
                    father_name,
                    mother_name,
                    gender,
                    dob,
                    mobile,
                    email,
                    school_name,
                    school_id,
                    district,
                    state,
                    class,
                    section,
                    shift_id,
                    room_id,
                    seat_id,
                    photo,
                    identity_document,
                    status,
                    roll_no,
                    roll_number,
                    admit_generated,
                    omr_generated,
                    created_at,
                    room_no,
                    seat_no,
                    archive,
                    pincode,
                    address,
                    archived_at
                )
                SELECT
                    id,
                    registration_no,
                    application_year,
                    full_name,
                    father_name,
                    mother_name,
                    gender,
                    dob,
                    mobile,
                    email,
                    school_name,
                    school_id,
                    district,
                    state,
                    class,
                    section,
                    shift_id,
                    room_id,
                    seat_id,
                    photo,
                    identity_document,
                    status,
                    roll_no,
                    roll_number,
                    admit_generated,
                    omr_generated,
                    created_at,
                    room_no,
                    seat_no,
                    0,
                    pincode,
                    address,
                    NULL
                FROM ${RECORDS_DB}.records_applications
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_exam_attendance
                (
                    id,
                    application_id,
                    qr_token,
                    attendance_status,
                    scanned_at,
                    scanned_by,
                    created_at
                )
                SELECT
                    id,
                    application_id,
                    qr_token,
                    attendance_status,
                    scanned_at,
                    scanned_by_user_id,
                    created_at
                FROM ${RECORDS_DB}.records_exam_attendance
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_exam_attendance_qr_history
                (
                    id,
                    application_id,
                    qr_token,
                    created_at
                )
                SELECT
                    id,
                    application_id,
                    qr_token,
                    created_at
                FROM ${RECORDS_DB}.records_exam_attendance_qr_history
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_results
                (
                    id,
                    application_id,
                    marks,
                    total_marks,
                    total_full_marks,
                    percentage,
                    grade,
                    rank_no,
                    result_status,
                    created_at,
                    section_rank,
                    overall_rank
                )
                SELECT
                    id,
                    application_id,
                    marks,
                    total_marks,
                    total_full_marks,
                    percentage,
                    grade,
                    rank_no,
                    result_status,
                    created_at,
                    section_rank,
                    overall_rank
                FROM ${RECORDS_DB}.records_results
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_result_component_marks
                (
                    id,
                    result_id,
                    component_id,
                    marks,
                    created_at,
                    updated_at
                )
                SELECT
                    id,
                    result_id,
                    component_id,
                    marks,
                    created_at,
                    updated_at
                FROM ${RECORDS_DB}.records_result_component_marks
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_result_qr
                (
                    id,
                    application_id,
                    qr_token,
                    created_at
                )
                SELECT
                    id,
                    application_id,
                    qr_token,
                    created_at
                FROM ${RECORDS_DB}.records_result_qr
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_certificates
                (
                    id,
                    application_id,
                    certificate_no,
                    certificate_type,
                    issue_date,
                    qr_code,
                    created_at
                )
                SELECT
                    id,
                    application_id,
                    certificate_no,
                    certificate_type,
                    issue_date,
                    qr_code,
                    created_at
                FROM ${RECORDS_DB}.records_certificates
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_counted_omr
                (
                    id,
                    application_id,
                    file_name,
                    original_name,
                    mime_type,
                    file_size,
                    created_at,
                    updated_at
                )
                SELECT
                    id,
                    application_id,
                    file_name,
                    original_name,
                    mime_type,
                    file_size,
                    created_at,
                    updated_at
                FROM ${RECORDS_DB}.records_counted_omr
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_login_information_pdfs
                (
                    id,
                    application_id,
                    file_name,
                    file_path,
                    prepared_at
                )
                SELECT
                    id,
                    application_id,
                    file_name,
                    file_path,
                    prepared_at
                FROM ${RECORDS_DB}.records_login_information_pdfs
                WHERE application_year = ?
            `, [year]);

            await connection.query(`
                INSERT INTO ${OP_DB}.rtse_admit_downloads
                (
                    id,
                    application_id,
                    registration_no,
                    student_name,
                    google_subject,
                    google_email,
                    google_name,
                    downloader_name,
                    mobile,
                    mobile_verified,
                    otp_provider,
                    otp_request_id,
                    verified_at,
                    downloaded_at,
                    ip_address,
                    user_agent
                )
                SELECT
                    id,
                    application_id,
                    registration_no,
                    student_name,
                    google_subject,
                    google_email,
                    google_name,
                    downloader_name,
                    mobile,
                    mobile_verified,
                    otp_provider,
                    otp_request_id,
                    verified_at,
                    downloaded_at,
                    ip_address,
                    user_agent
                FROM ${RECORDS_DB}.records_admit_downloads
                WHERE application_year = ?
            `, [year]);

            /*
             * ----------------------------------------------------
             * RESTORE VERIFICATION
             * ----------------------------------------------------
             */

            const destinationChecks = [
                [
                    "mark_components",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_mark_components
                     WHERE application_year = ?`
                ],
                [
                    "rooms",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_seat_plan_rooms
                     WHERE application_year = ?`
                ],
                [
                    "seats",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_seat_plan_seats s
                     JOIN ${OP_DB}.rtse_seat_plan_rooms r
                       ON r.id = s.room_id
                     WHERE r.application_year = ?`
                ],
                [
                    "assignments",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_school_centre_assignments
                     WHERE application_year = ?`
                ],
                [
                    "applications",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_applications
                     WHERE application_year = ?`
                ],
                [
                    "attendance",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_exam_attendance ea
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = ea.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "attendance_qr_history",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_exam_attendance_qr_history h
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = h.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "results",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_results r
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = r.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "result_component_marks",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_result_component_marks cm
                     JOIN ${OP_DB}.rtse_results r
                       ON r.id = cm.result_id
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = r.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "result_qr",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_result_qr q
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = q.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "certificates",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_certificates c
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = c.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "counted_omr",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_counted_omr o
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = o.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "login_information_pdfs",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_login_information_pdfs p
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = p.application_id
                     WHERE a.application_year = ?`
                ],
                [
                    "admit_downloads",
                    `SELECT COUNT(*) AS total
                     FROM ${OP_DB}.rtse_admit_downloads d
                     JOIN ${OP_DB}.rtse_applications a
                       ON a.id = d.application_id
                     WHERE a.application_year = ?`
                ]
            ];

            for (const [label, sql] of destinationChecks) {
                const [[row]] = await connection.query(sql, [year]);

                if (Number(row.total) !== sourceCounts[label]) {
                    throw new Error(
                        `Reopen verification failed for ${label}: ` +
                        `Records DB=${sourceCounts[label]}, ` +
                        `Operational DB=${row.total}.`
                    );
                }
            }

            /*
             * Relationship verification after restore.
             */

            const relationshipChecks = [
                [
                    `SELECT COUNT(*) AS bad
                     FROM ${OP_DB}.rtse_applications a
                     LEFT JOIN ${OP_DB}.arsp_schools s
                       ON s.id = a.school_id
                     WHERE a.application_year = ?
                       AND a.school_id IS NOT NULL
                       AND s.id IS NULL`,
                    "application -> school"
                ],
                [
                    `SELECT COUNT(*) AS bad
                     FROM ${OP_DB}.rtse_applications a
                     LEFT JOIN ${OP_DB}.rtse_seat_plan_shifts ss
                       ON ss.id = a.shift_id
                     WHERE a.application_year = ?
                       AND a.shift_id IS NOT NULL
                       AND ss.id IS NULL`,
                    "application -> shift"
                ],
                [
                    `SELECT COUNT(*) AS bad
                     FROM ${OP_DB}.rtse_applications a
                     LEFT JOIN ${OP_DB}.rtse_seat_plan_rooms r
                       ON r.id = a.room_id
                     WHERE a.application_year = ?
                       AND a.room_id IS NOT NULL
                       AND r.id IS NULL`,
                    "application -> room"
                ],
                [
                    `SELECT COUNT(*) AS bad
                     FROM ${OP_DB}.rtse_applications a
                     LEFT JOIN ${OP_DB}.rtse_seat_plan_seats s
                       ON s.id = a.seat_id
                     WHERE a.application_year = ?
                       AND a.seat_id IS NOT NULL
                       AND s.id IS NULL`,
                    "application -> seat"
                ],
                [
                    `SELECT COUNT(*) AS bad
                     FROM ${OP_DB}.rtse_school_centre_assignments x
                     LEFT JOIN ${OP_DB}.arsp_schools s
                       ON s.id = x.school_id
                     LEFT JOIN ${OP_DB}.rtse_centres c
                       ON c.id = x.centre_id
                     WHERE x.application_year = ?
                       AND (s.id IS NULL OR c.id IS NULL)`,
                    "assignment -> school/centre"
                ],
                [
                    `SELECT COUNT(*) AS bad
                     FROM ${OP_DB}.rtse_exam_attendance ea
                     LEFT JOIN ${OP_DB}.rtse_applications a
                       ON a.id = ea.application_id
                     WHERE a.id IS NULL`,
                    "attendance -> application"
                ],
                [
                    `SELECT COUNT(*) AS bad
                     FROM ${OP_DB}.rtse_results r
                     LEFT JOIN ${OP_DB}.rtse_applications a
                       ON a.id = r.application_id
                     WHERE a.id IS NULL`,
                    "result -> application"
                ],
                [
                    `SELECT COUNT(*) AS bad
                     FROM ${OP_DB}.rtse_result_component_marks cm
                     LEFT JOIN ${OP_DB}.rtse_results r
                       ON r.id = cm.result_id
                     LEFT JOIN ${OP_DB}.rtse_mark_components mc
                       ON mc.id = cm.component_id
                     WHERE r.id IS NULL OR mc.id IS NULL`,
                    "result component mark -> result/component"
                ],
                [
                    `SELECT COUNT(*) AS bad
                     FROM ${OP_DB}.rtse_certificates c
                     LEFT JOIN ${OP_DB}.rtse_applications a
                       ON a.id = c.application_id
                     WHERE a.id IS NULL`,
                    "certificate -> application"
                ]
            ];

            for (const [sql, label] of relationshipChecks) {
                const params = sql.includes("application_year = ?") ? [year] : [];
                const [[row]] = await connection.query(sql, params);

                if (Number(row.bad) !== 0) {
                    throw new Error(
                        `Relationship verification failed: ${label}.`
                    );
                }
            }

            /*
             * ----------------------------------------------------
             * TRUE UNDO: remove the historical Records snapshot.
             * Physical files are NOT touched.
             * ----------------------------------------------------
             */

            const recordsDeletes = [
                "records_admit_downloads",
                "records_login_information_pdfs",
                "records_counted_omr",
                "records_certificates",
                "records_result_qr",
                "records_result_component_marks",
                "records_results",
                "records_exam_attendance_qr_history",
                "records_exam_attendance",
                "records_applications",
                "records_school_centre_assignments",
                "records_seat_plan_seats",
                "records_seat_plan_rooms",
                "records_mark_components",
                "records_exam_shift_sections",
                "records_exam_shifts",
                "records_exam_settings",
                "records_seat_plan_shifts",
                "records_centres",
                "records_schools",
                "records_certificate_category_settings",
                "records_certificate_settings"
            ];

            for (const table of recordsDeletes) {
                await connection.query(`
                    DELETE FROM ${RECORDS_DB}.${table}
                    WHERE application_year = ?
                `, [year]);
            }

            const [[remaining]] = await connection.query(`
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM ${RECORDS_DB}.records_applications
                        WHERE application_year = ?
                    ) AS applications,
                    (
                        SELECT COUNT(*)
                        FROM ${RECORDS_DB}.records_school_centre_assignments
                        WHERE application_year = ?
                    ) AS assignments,
                    (
                        SELECT COUNT(*)
                        FROM ${RECORDS_DB}.records_seat_plan_rooms
                        WHERE application_year = ?
                    ) AS rooms,
                    (
                        SELECT COUNT(*)
                        FROM ${RECORDS_DB}.records_seat_plan_seats
                        WHERE application_year = ?
                    ) AS seats,
                    (
                        SELECT COUNT(*)
                        FROM ${RECORDS_DB}.records_exam_attendance
                        WHERE application_year = ?
                    ) AS attendance,
                    (
                        SELECT COUNT(*)
                        FROM ${RECORDS_DB}.records_results
                        WHERE application_year = ?
                    ) AS results,
                    (
                        SELECT COUNT(*)
                        FROM ${RECORDS_DB}.records_certificates
                        WHERE application_year = ?
                    ) AS certificates
            `, [
                year,
                year,
                year,
                year,
                year,
                year,
                year
            ]);

            if (
                Number(remaining.applications) !== 0 ||
                Number(remaining.assignments) !== 0 ||
                Number(remaining.rooms) !== 0 ||
                Number(remaining.seats) !== 0 ||
                Number(remaining.attendance) !== 0 ||
                Number(remaining.results) !== 0 ||
                Number(remaining.certificates) !== 0
            ) {
                throw new Error(
                    `Records DB cleanup verification failed for ${year}.`
                );
            }

            await connection.query(`
                UPDATE ${RECORDS_DB}.records_archive_years
                SET
                    archive_status = 'REOPENED',
                    archived_at = NULL,
                    reopened_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE application_year = ?
            `, [year]);

            await connection.commit();

            const [[result]] = await recordsDb.query(`
                SELECT *
                FROM ${RECORDS_DB}.records_archive_years
                WHERE application_year = ?
            `, [year]);

            return result;
        } catch (error) {
            try {
                await connection.rollback();
            } catch (_) {}

            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = RtseRecordsYear;
