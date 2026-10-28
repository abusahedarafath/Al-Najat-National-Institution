const db = require("../config/database");
const RtseExamSetting = require("./RtseExamSetting");
const RtseExamSection = require("./RtseExamSection");


class RtseApplication {

    // =====================================
    // Generate Registration Number
    // =====================================

    static async generateRegistrationNumber(examYear) {
        const fullYear = Number(examYear);

        if (!Number.isInteger(fullYear) || fullYear < 2000 || fullYear > 9999) {
            throw new Error("A valid examination year is required for registration.");
        }

        const prefix = `ARSP${String(fullYear).slice(-2)}`;

        // Find the highest valid serial for this examination year only.
        const [rows] = await db.query(
            `SELECT registration_no
             FROM rtse_applications
             WHERE registration_no LIKE ?
               AND registration_no REGEXP '^ARSP[0-9]{7}$'
             ORDER BY CAST(RIGHT(registration_no, 5) AS UNSIGNED) DESC,
                      id DESC
             LIMIT 1`,
            [`${prefix}%`]
        );

        let serial = 1;

        if (rows.length) {
            serial = Number(rows[0].registration_no.slice(-5)) + 1;
        }

        if (serial > 99999) {
            throw new Error("Registration serial limit reached for this examination year.");
        }

        return `${prefix}${String(serial).padStart(5, "0")}`;
    }

    // Get Section
    // =====================================

    // =====================================
    // Duplicate Candidate Identity Check
    // =====================================
    static async findDuplicateByIdentity(data) {

        const normalize = (value) =>
            String(value || "")
                .trim()
                .replace(/\s+/g, " ")
                .toLowerCase();

        const fullName = normalize(data.full_name);
        const fatherName = normalize(data.father_name);
        const motherName = normalize(data.mother_name);
        const schoolName = normalize(data.school_name);
        const dob = String(data.dob || "").trim();

        if (
            !fullName ||
            !fatherName ||
            !motherName ||
            !schoolName ||
            !dob
        ) {
            return null;
        }

        /*
         * Use DATE_FORMAT() for DOB.
         *
         * MariaDB returns DATE values to Node as JavaScript Date
         * objects in this project. Comparing row.dob directly can
         * therefore suffer from timezone conversion.
         */

        const [rows] = await db.query(
            `
            SELECT
                id,
                registration_no,
                full_name,
                father_name,
                mother_name,
                DATE_FORMAT(dob, '%Y-%m-%d') AS dob_string,
                school_name
            FROM rtse_applications
            WHERE archive=0
              AND DATE_FORMAT(dob, '%Y-%m-%d')=?
              AND LOWER(TRIM(school_name))=?
            ORDER BY id ASC
            LIMIT 50
            `,
            [dob, schoolName]
        );

        for (const row of rows) {

            if (
                normalize(row.full_name) === fullName &&
                normalize(row.father_name) === fatherName &&
                normalize(row.mother_name) === motherName &&
                normalize(row.school_name) === schoolName &&
                String(row.dob_string || "").trim() === dob
            ) {

                return {
                    full_name: row.full_name,
                    father_name: row.father_name,
                    mother_name: row.mother_name,
                    dob: row.dob_string,
                    school_name: row.school_name,
                    registration_no: row.registration_no
                };
            }
        }

        return null;
    }

    // =====================================
    // Create Application
    // =====================================

    static async create(data){
        let examSettingId = null;

        const suppliedExamSettingId =
            data.exam_setting_id !== undefined &&
            data.exam_setting_id !== null &&
            data.exam_setting_id !== "";

        if (suppliedExamSettingId) {
            examSettingId = Number(data.exam_setting_id);

            if (!Number.isInteger(examSettingId) || examSettingId <= 0) {
                throw new Error("Invalid examination setting ID.");
            }
        } else {
            // Detect migration readiness without assuming that the new schema exists.
            // No application data is modified by these metadata checks.
            const [schemaRows] = await db.query(`
                SELECT
                    EXISTS(
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = DATABASE()
                          AND table_name = 'rtse_exam_sections'
                    ) AS has_sections_table,
                    EXISTS(
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = DATABASE()
                          AND table_name = 'rtse_exam_section_classes'
                    ) AS has_class_mapping_table,
                    EXISTS(
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = DATABASE()
                          AND table_name = 'rtse_applications'
                          AND column_name = 'exam_setting_id'
                    ) AS has_application_exam_column
            `);

            const schemaState = schemaRows[0] || {};
            const readiness = [
                Number(schemaState.has_sections_table) === 1,
                Number(schemaState.has_class_mapping_table) === 1,
                Number(schemaState.has_application_exam_column) === 1
            ];
            const availableParts = readiness.filter(Boolean).length;

            if (availableParts > 0 && availableParts < readiness.length) {
                throw new Error(
                    "The custom examination-section migration is incomplete. " +
                    "Registration is paused to protect application data."
                );
            }

            if (availableParts === readiness.length) {
                const activeExam = await RtseExamSetting.getActive();

                if (!activeExam || !Number.isInteger(Number(activeExam.id))) {
                    throw new Error(
                        "No valid active examination is configured for registration."
                    );
                }

                examSettingId = Number(activeExam.id);
            }
        }




        let section;
        if (examSettingId !== null) {
            const exam = await RtseExamSetting.getById(examSettingId);
            if (!exam) {
                throw new Error("Examination not found.");
            }

            const registrationYear = Number(exam.exam_year);
            if (!Number.isInteger(registrationYear) ||
                registrationYear < 2000 || registrationYear > 9999) {
                throw new Error("The selected examination has an invalid examination year.");
            }

            const mappedSection = await RtseExamSection.getSectionForClass(
                examSettingId,
                data.class
            );

            if (!mappedSection) {
                throw new Error(
                    "This class is not mapped to a section for this examination."
                );
            }

            section = data.section !== undefined &&
                data.section !== null &&
                String(data.section).trim() !== ""
                ? String(data.section).trim().toUpperCase()
                : mappedSection;

            if (section !== mappedSection) {
                throw new Error(
                    "The submitted section does not match this class's examination mapping."
                );
            }
        } else {
            throw new Error("Examination mapping is unavailable; registration is paused.");
        }

        // Generate the registration number using the configured exam year.
        let registrationYear;

        if (examSettingId !== null) {
            const linkedExamSetting =
                await RtseExamSetting.getById(examSettingId);

            registrationYear = Number(linkedExamSetting?.exam_year);
        } else {
            const activeExamSetting = await RtseExamSetting.getActive();

            registrationYear = activeExamSetting
                ? Number(activeExamSetting.exam_year)
                : new Date().getFullYear();
        }

        if (
            !Number.isInteger(registrationYear) ||
            registrationYear < 2000 ||
            registrationYear > 9999
        ) {
            throw new Error("A valid examination year is required for registration.");
        }

        const registrationNo =
            await this.generateRegistrationNumber(registrationYear);


        // Keep the existing application year behavior unchanged.
        const columns = [
            "registration_no",
            "application_year"
        ];

        const values = [
            registrationNo,
            registrationYear
        ];

        // The optional column is used only after the additive migration
        // has been applied and a trusted controller supplies the ID.
        if (examSettingId !== null) {
            columns.push("exam_setting_id");
            values.push(examSettingId);
        }






        columns.push(
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
            "pincode",
            "class",
            "section",
            "address",
            "photo",
            "identity_document"
        );

        values.push(
            data.full_name,
            data.father_name,
            data.mother_name,
            data.gender,
            data.dob,
            data.mobile,
            data.email,
            data.school_name,
            data.school_id || null,
            data.district,
            data.state,
            data.pincode,
            data.class,
            section,
            data.address,
            data.photo,
            data.identity_document
        );

        const placeholders = columns.map(() => "?").join(", ");

        const sql = `
            INSERT INTO rtse_applications
                (${columns.join(", ")})
            VALUES (${placeholders})
        `;

        const [result] = await db.query(sql, values);

        return {
            id: result.insertId,
            registration_no: registrationNo,
            application_year: registrationYear,
            section
        };
    }

    // Dashboard
    // =====================================

    static async getAll(){

        const [rows] = await db.query(

            `SELECT
                id,
                registration_no,
                full_name,
                father_name,
                dob,
                gender,
                school_name,
                class,
                section,
                district,
                mobile,
                status,
                roll_no,
                admit_generated,
                photo
             FROM rtse_applications
             WHERE archive=0
             ORDER BY
                CASE
                    WHEN status='Pending' THEN 1
                    WHEN status='Approved' THEN 2
                    WHEN status='Rejected' THEN 3
                    ELSE 4
                END,
                registration_no ASC`

        );

        return rows;

    }

    
    // =====================================
    // Dashboard Applications - Paginated
    // =====================================

    static async getDashboardApplications(
        limit = 10,
        offset = 0,
        search = "",
        status = ""
    ){

        limit = Math.max(
            1,
            Math.min(100, Number(limit) || 10)
        );

        offset = Math.max(
            0,
            Number(offset) || 0
        );

        search = String(search || "").trim();
        status = String(status || "").trim();

        const allowedStatuses = [
            "Pending",
            "Approved",
            "Rejected"
        ];

        let whereSql = `
            archive=0
            AND NOT EXISTS (
                SELECT 1
                FROM rtse_exam_attendance ea
                WHERE ea.application_id = rtse_applications.id
                  AND ea.attendance_status = 'PRESENT'
            )
        `;
        let params = [];

        if (allowedStatuses.includes(status)) {
            whereSql += " AND status=?";
            params.push(status);
        }

        /*
         * Combined Class + Section search.
         *
         * 7 B -> Class 7 + Section B
         * B 7 -> Class 7 + Section B
         */
        const classThenSection = search.match(/^(.+?)\s+([A-Za-z])$/);
        const sectionThenClass = search.match(/^([A-Za-z])\s+(.+)$/);

        // Prefer "Section Class" only when the class portion does not
        // itself end in a single-letter section token.
        const useSectionFirst = Boolean(
            sectionThenClass &&
            !/\s+[A-Za-z]$/.test(sectionThenClass[2])
        );

        const combinedMatch = useSectionFirst
            ? sectionThenClass
            : (classThenSection || sectionThenClass);

        if (combinedMatch) {
            const classValue = String(
                useSectionFirst
                    ? sectionThenClass[2]
                    : classThenSection[1]
            ).trim();

            const sectionValue = useSectionFirst
                ? sectionThenClass[1]
                : classThenSection[2];

            whereSql += `
                AND LOWER(TRIM(CAST(class AS CHAR))) = LOWER(?)
                AND UPPER(section)=?
            `;

            params.push(classValue, sectionValue.toUpperCase());

        } else if (search) {

            const searchValue = `%${search}%`;

            whereSql += `
                AND (
                    registration_no LIKE ?
                    OR full_name LIKE ?
                    OR mobile LIKE ?
                    OR school_name LIKE ?
                    OR CAST(class AS CHAR) LIKE ?
                    OR section LIKE ?
                    OR status LIKE ?
                    OR roll_no LIKE ?
                )
            `;

            params.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }

        const [rows] = await db.query(
            `SELECT
                id,
                registration_no,
                full_name,
                father_name,
                mobile,
                school_name,
                class,
                section,
                status,
                roll_no,
                photo,
                admit_generated
             FROM rtse_applications
             WHERE ${whereSql}
             ORDER BY
                CASE
                    WHEN status='Pending' THEN 1
                    WHEN status='Approved' THEN 2
                    WHEN status='Rejected' THEN 3
                    ELSE 4
                END,
                registration_no ASC
             LIMIT ? OFFSET ?`,
            [
                ...params,
                limit,
                offset
            ]
        );

        return rows;
    }


    static async getDashboardApplicationCount(
        search = "",
        status = ""
    ){

        search = String(search || "").trim();
        status = String(status || "").trim();

        const allowedStatuses = [
            "Pending",
            "Approved",
            "Rejected"
        ];

        let whereSql = `
            archive=0
            AND NOT EXISTS (
                SELECT 1
                FROM rtse_exam_attendance ea
                WHERE ea.application_id = rtse_applications.id
                  AND ea.attendance_status = 'PRESENT'
            )
        `;
        let params = [];

        if (allowedStatuses.includes(status)) {
            whereSql += " AND status=?";
            params.push(status);
        }

        const classThenSection = search.match(/^(.+?)\s+([A-Za-z])$/);
        const sectionThenClass = search.match(/^([A-Za-z])\s+(.+)$/);

        // Prefer "Section Class" only when the class portion does not
        // itself end in a single-letter section token.
        const useSectionFirst = Boolean(
            sectionThenClass &&
            !/\s+[A-Za-z]$/.test(sectionThenClass[2])
        );

        const combinedMatch = useSectionFirst
            ? sectionThenClass
            : (classThenSection || sectionThenClass);

        if (combinedMatch) {
            const classValue = String(
                useSectionFirst
                    ? sectionThenClass[2]
                    : classThenSection[1]
            ).trim();

            const sectionValue = useSectionFirst
                ? sectionThenClass[1]
                : classThenSection[2];

            whereSql += `
                AND LOWER(TRIM(CAST(class AS CHAR))) = LOWER(?)
                AND UPPER(section)=?
            `;

            params.push(classValue, sectionValue.toUpperCase());

        } else if (search) {

            const searchValue = `%${search}%`;

            whereSql += `
                AND (
                    registration_no LIKE ?
                    OR full_name LIKE ?
                    OR mobile LIKE ?
                    OR school_name LIKE ?
                    OR CAST(class AS CHAR) LIKE ?
                    OR section LIKE ?
                    OR status LIKE ?
                    OR roll_no LIKE ?
                )
            `;

            params.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }

        const [rows] = await db.query(
            `SELECT COUNT(*) AS total
             FROM rtse_applications
             WHERE ${whereSql}`,
            params
        );

        return Number(rows[0]?.total || 0);
    }


static async getById(id){

    const [rows] = await db.query(

        `SELECT *
         FROM rtse_applications
         WHERE id=?`,

        [id]

    );

    return rows[0] || null;

}



// =====================================
// Get Application By Registration + Mobile
// =====================================

static async getByRegistrationAndMobile(
    registrationNo,
    mobile
){

    const [rows] = await db.query(
        `SELECT *
         FROM rtse_applications
         WHERE registration_no=?
         AND mobile=?
         AND archive=0
         LIMIT 1`,
        [
            registrationNo,
            mobile
        ]
    );

    return rows[0] || null;
}


// =====================================
// Get Application By Registration Only
// Used by ARSP Full Access after member verification.
// =====================================

static async getByRegistrationOnly(
    registrationNo
){

    const [rows] = await db.query(
        `SELECT *
         FROM rtse_applications
         WHERE registration_no=?
         AND archive=0
         LIMIT 1`,
        [
            registrationNo
        ]
    );

    return rows[0] || null;
}


// =====================================
// Search Student For ARSP Admit Card
// =====================================

static async searchForAdmitCardByRegistration(
    registrationNo
){

    const [rows] = await db.query(
        `SELECT
            registration_no,
            full_name,
            father_name,
            school_name,
            class,
            section
         FROM rtse_applications
         WHERE registration_no=?
         AND archive=0
         LIMIT 1`,
        [
            registrationNo
        ]
    );

    return rows[0] || null;
}



// =====================================
// Partial Access Student Search For ARSP
// =====================================

static async searchForAdmitCardPartial(keyword) {

    const value =
        String(keyword || "").trim();

    if (!value) {
        return [];
    }

    const search =
        `%${value}%`;

    const [rows] = await db.query(
        `SELECT
            registration_no,
            full_name,
            father_name,
            school_name,
            class,
            section
         FROM rtse_applications
         WHERE
            archive=0
            AND (
                registration_no LIKE ?
                OR full_name LIKE ?
                OR father_name LIKE ?
            )
         ORDER BY
            CASE
                WHEN registration_no = ? THEN 0
                WHEN full_name = ? THEN 1
                WHEN father_name = ? THEN 2
                ELSE 3
            END,
            full_name ASC,
            registration_no ASC
         LIMIT 50`,
        [
            search,
            search,
            search,
            value,
            value,
            value
        ]
    );

    return rows;
}

// Universal Student Search For ARSP
// =====================================

static async searchForAdmitCardUniversal(keyword) {

    const value =
        String(keyword || "").trim();

    if (!value) {
        return [];
    }

    const search =
        `%${value}%`;

    const [rows] = await db.query(
        `SELECT
            registration_no,
            full_name,
            father_name,
            school_name,
            class,
            section
         FROM rtse_applications
         WHERE
            archive=0
            AND (
                registration_no LIKE ?
                OR full_name LIKE ?
                OR mobile LIKE ?
                OR father_name LIKE ?
                OR school_name LIKE ?
            )
         ORDER BY
            CASE
                WHEN registration_no = ? THEN 0
                WHEN mobile = ? THEN 1
                WHEN full_name = ? THEN 2
                ELSE 3
            END,
            full_name ASC,
            registration_no ASC
         LIMIT 50`,
        [
            search,
            search,
            search,
            search,
            search,
            value,
            value,
            value
        ]
    );

    return rows;
}

// =====================================
// Get Public Verification Details
// =====================================

static async getPublicVerification(
    registrationNo
){

    const [rows] = await db.query(
        `SELECT
            registration_no,
            application_year,
            full_name,
            school_name,
            class,
            section,
            status
         FROM rtse_applications
         WHERE registration_no=?
         AND archive=0
         LIMIT 1`,
        [
            registrationNo
        ]
    );

    return rows[0] || null;
}


// =====================================
// Move Approved Student Back To Pending
// =====================================

static async makePending(id){

    await db.query(

        `UPDATE rtse_applications

         SET
            status='Pending',
            roll_no=NULL,
            roll_number=NULL,
            admit_generated=0,
            room_no=NULL,
            seat_no=NULL

         WHERE id=?`,

        [
            id
        ]

    );

}


// =====================================
// Update Status
// =====================================

static async updateStatus(id,status){

    await db.query(

        `UPDATE rtse_applications
         SET status=?
         WHERE id=?`,

        [

            status,

            id

        ]

    );

}



// =====================================
// Archive Application
// =====================================

static async archive(id){

    await db.query(

        `UPDATE rtse_applications

         SET

            archive=1,

            archived_at=NOW()

         WHERE id=?`,

        [

            id

        ]

    );

}



// =====================================
// Get Archived Applications
// =====================================

static async getArchived(){

    const [rows] = await db.query(

        `SELECT *

         FROM rtse_applications

         WHERE archive=1

         ORDER BY registration_no ASC`

    );

    return rows;

}



// =====================================
// Restore Application
// =====================================

static async restore(id){

    await db.query(

        `UPDATE rtse_applications

         SET

            archive=0,

            archived_at=NULL

         WHERE id=?`,

        [

            id

        ]

    );

}




// =====================================
// Permanently Delete Application
// =====================================

static async permanentDelete(id){

    const application =
        await this.getById(id);

    if(!application)
        return false;

    const fs =
        require("fs");

    const path =
        require("path");

    // Delete Photo

    if(application.photo){

        const photoPath =
            path.join(

                __dirname,

                "..",

                "public",

                "uploads",

                "rtse",

                application.photo

            );

        if(fs.existsSync(photoPath))
            fs.unlinkSync(photoPath);

    }

    // Delete Identity Document

    if(application.identity_document){

        const docPath =
            path.join(

                __dirname,

                "..",

                "public",

                "uploads",

                "rtse",

                application.identity_document

            );

        if(fs.existsSync(docPath))
            fs.unlinkSync(docPath);

    }

await db.query(
    `DELETE
     FROM rtse_applications
     WHERE id=?`,
    [id]
);

return true;
}


// =====================================
// Dashboard Statistics
// =====================================

static async getDashboardStats(examSettingId){

    const examId = Number(examSettingId);

    if (!Number.isInteger(examId) || examId <= 0) {
        throw new Error("A valid configured examination is required for RTSE dashboard statistics.");
    }

    const [rows] = await db.query(
        `SELECT
            COUNT(*) AS total,
            COALESCE(SUM(status = 'Pending'), 0) AS pending,
            COALESCE(SUM(status = 'Approved'), 0) AS approved,
            COALESCE(SUM(status = 'Rejected'), 0) AS rejected,
            COALESCE(SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END), 0) AS male,
            COALESCE(SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END), 0) AS female,
            COALESCE(SUM(roll_no IS NOT NULL), 0) AS roll_generated,
            COALESCE(SUM(admit_generated = 1), 0) AS admit_generated
         FROM rtse_applications
         WHERE archive = 0
           AND exam_setting_id = ?`,
        [examId]
    );

    return rows[0];
}


// =====================================
// Get Section Wise Count
// =====================================

static async getSectionCounts(){

    const [rows] = await db.query(

        `SELECT

            section,

            COUNT(*) total

        FROM rtse_applications

        WHERE archive=0

        GROUP BY section

        ORDER BY section`

    );

    return rows;

}





// =====================================
// Generate Roll Numbers
// =====================================

static async generateRollNumbers(section, applicationYear, examSettingId) {
    const normalizedSection = String(section || "").trim().toUpperCase();
   const year = String(applicationYear).slice(-2);

    if (!normalizedSection || !Number.isInteger(Number(applicationYear))) {
        throw new Error("A valid section and application year are required.");
    }

    const examId = Number(examSettingId);
    if (!Number.isInteger(examId) || examId <= 0) {
        throw new Error("A valid configured examination is required.");
    }

    const RtseExamSection = require("./RtseExamSection");
    const sections = await RtseExamSection.getSections(examId);
    const configured = sections.find(
        item => String(item.section_name || "").trim().toUpperCase() === normalizedSection
    );

    if (!configured) {
        throw new Error(`Section ${normalizedSection} is not configured for this examination.`);
    }

    const rangeStart = Number(configured.roll_start);
    const rangeEnd = Number(configured.roll_end);

    if (!Number.isInteger(rangeStart) || !Number.isInteger(rangeEnd) ||
        rangeStart <= 0 || rangeEnd < rangeStart) {
        throw new Error("The configured section has an invalid roll-number range.");
    }

    const filters = [
        "archive = 0",
        "status = 'Approved'",
        "application_year = ?",
        "section = ?",
        "exam_setting_id = ?"
    ];
    const params = [applicationYear, normalizedSection, examId];

    const [students] = await db.query(
        `SELECT id, school_id, registration_no, full_name, roll_no, roll_number
         FROM rtse_applications
         WHERE ${filters.join(" AND ")}
         ORDER BY full_name ASC, registration_no ASC`,
        params
    );

    if (!students.length) {
        return 0;
    }

    // Resolve each school's approved centre for this examination year.
    const schoolIds = [...new Set(students.map(s => Number(s.school_id)))];

    if (schoolIds.some(id => !Number.isInteger(id) || id <= 0)) {
        throw new Error(
            "At least one approved student has no valid school ID. No roll numbers were generated."
        );
    }

    const placeholders = schoolIds.map(() => "?").join(", ");
    const [centreRows] = await db.query(
        `SELECT sca.school_id, c.centre_code
         FROM rtse_school_centre_assignments sca
         INNER JOIN rtse_centres c ON c.id = sca.centre_id
         WHERE sca.application_year = ?
           AND sca.school_id IN (${placeholders})
           AND sca.status IN ('Approved', 'Active')
           AND c.status = 'Approved'`,
        [applicationYear, ...schoolIds]
    );

    const centreCodeBySchool = new Map(
        centreRows.map(row => [Number(row.school_id), String(row.centre_code || "").trim()])
    );

    const missingCentre = students.find(student => {
        const code = centreCodeBySchool.get(Number(student.school_id));
        return !code;
    });

    if (missingCentre) {
        throw new Error(
            `No approved centre assignment with an approved centre exists for school ID ${missingCentre.school_id} in ${applicationYear}. No roll numbers were generated.`
        );
    }

    // Do not silently rewrite already assigned examination identities.
    const alreadyAssigned = students.filter(
        student => student.roll_no !== null || student.roll_number !== null
    );

    if (alreadyAssigned.length) {
        throw new Error(
            `${alreadyAssigned.length} student(s) already have roll numbers. ` +
            "Generation stopped to protect existing roll numbers. " +
            "Use an explicitly reviewed reset workflow if a reset is genuinely required."
        );
    }

    const capacity = rangeEnd - rangeStart + 1;

    if (students.length > capacity) {
        throw new Error(
            `Roll range exhausted for section ${normalizedSection}: ` +
            `${students.length} approved students but only ${capacity} roll numbers are available ` +
            `(${rangeStart}–${rangeEnd}). No roll numbers were generated.`
        );
    }

    // Check for pre-existing roll-number collisions before writing anything.
    const [collisionRows] = await db.query(
        `SELECT id
         FROM rtse_applications
         WHERE application_year = ?
           AND archive = 0
           AND (
               roll_number BETWEEN ? AND ?
               OR (
                   roll_no IS NOT NULL
                   AND CAST(
                       SUBSTRING_INDEX(roll_no, '-', -1)
                       AS UNSIGNED
                   ) BETWEEN ? AND ?
               )
           )
         LIMIT 1`,
        [
            applicationYear,
            rangeStart,
            rangeEnd,
            rangeStart,
            rangeEnd
        ]
    );

    if (collisionRows.length) {
        throw new Error(
            `Roll-number range ${rangeStart}–${rangeEnd} already contains assigned numbers. ` +
            "Generation stopped to avoid collisions."
        );
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        for (let index = 0; index < students.length; index++) {
            const roll = rangeStart + index;
            const centreCode = centreCodeBySchool.get(Number(students[index].school_id));
            const rollNo = `${centreCode}-${roll}`;

            const updateExamFilter = examId !== null
                ? "AND exam_setting_id = ?"
                : "";
            const updateParams = [
                rollNo,
                roll,
                students[index].id,
                applicationYear
            ];

            if (examId !== null) {
                updateParams.push(examId);
            }

            const [result] = await connection.query(
                `UPDATE rtse_applications
                 SET roll_no = ?, roll_number = ?
                 WHERE id = ?
                   AND application_year = ?
                   AND archive = 0
                   AND status = 'Approved'
                   AND roll_no IS NULL
                   AND roll_number IS NULL
                   ${updateExamFilter}`,
                updateParams
            );

            if (result.affectedRows !== 1) {
                throw new Error(
                    "A student record changed during roll generation. " +
                    "The operation was stopped and rolled back."
                );
            }
        }

        await connection.commit();
        return students.length;
    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error("RTSE roll generation rollback error:", rollbackError.message);
        }
        throw error;
    } finally {
        connection.release();
    }
}
// =====================================
// Check Roll Generated
// =====================================

static async isRollGenerated(section){

    const [rows] = await db.query(

        `SELECT id

         FROM rtse_applications

         WHERE

            section=?

         AND

            roll_no IS NOT NULL

         LIMIT 1`,

        [

            section

        ]

    );

    return rows.length>0;

}



// =====================================
// Get Section Students
// =====================================

static async getSectionStudents(section){

    const [rows] = await db.query(

        `SELECT *

         FROM rtse_applications

         WHERE

            archive=0

         AND

            section=?

         ORDER BY

            roll_no ASC`,

        [

            section

        ]

    );

    return rows;

}


// =====================================
// Get Approved Students - Section Wise
// =====================================

static async getApprovedSectionStudents(section, applicationYear){

    const normalizedSection =
        String(section || "").trim().toUpperCase();

    const normalizedYear =
        Number(applicationYear);

    const RtseExamSetting = require("./RtseExamSetting");
        const RtseExamSection = require("./RtseExamSection");
        const activeExam = await RtseExamSetting.get();
        const configuredSections = activeExam?.id
            ? await RtseExamSection.getSections(activeExam.id)
            : [];

        if (!configuredSections.some(
            item => String(item.section_name || "").trim().toUpperCase() === normalizedSection
        )) {
            throw new Error("Invalid RTSE section for the active examination.");
        }

    if(!normalizedYear){
        throw new Error("Invalid RTSE application year.");
    }

    const [rows] = await db.query(
        `SELECT *
         FROM rtse_applications
         WHERE
            archive=0
         AND
            status='Approved'
         AND
            application_year=?
         AND
            section=?
         ORDER BY
            CASE
                WHEN roll_number IS NULL THEN 1
                ELSE 0
            END,

            roll_number ASC,
            full_name ASC`,
        [
            normalizedYear,
            normalizedSection
        ]
    );

    return rows;
}


// =====================================
static async getExamApprovedSectionStudents(section, applicationYear, examSettingId) {
    const normalizedSection = String(section || "").trim().toUpperCase();
    const year = Number(applicationYear);
    const examId = Number(examSettingId);

    if (!normalizedSection || !Number.isInteger(year) || year <= 0 ||
        !Number.isInteger(examId) || examId <= 0) {
        throw new Error("A valid section, application year, and examination are required.");
    }

    const RtseExamSection = require("./RtseExamSection");
    const sections = await RtseExamSection.getSections(examId);
    if (!sections.some(item => String(item.section_name).trim().toUpperCase() === normalizedSection)) {
        throw new Error("The section is not configured for this examination.");
    }

    const [rows] = await db.query(
        `SELECT *
         FROM rtse_applications
         WHERE archive = 0
           AND status = 'Approved'
           AND application_year = ?
           AND section = ?
           AND exam_setting_id = ?
         ORDER BY
           CASE WHEN roll_number IS NULL THEN 1 ELSE 0 END,
           roll_number ASC,
           full_name ASC`,
        [year, normalizedSection, examId]
    );
    return rows;
}

static async searchExamApprovedSectionStudents(section, applicationYear, keyword, examSettingId) {
    const normalizedSection = String(section || "").trim().toUpperCase();
    const year = Number(applicationYear);
    const examId = Number(examSettingId);

    if (!normalizedSection || !Number.isInteger(year) || year <= 0 ||
        !Number.isInteger(examId) || examId <= 0) {
        throw new Error("A valid section, application year, and examination are required.");
    }

    const RtseExamSection = require("./RtseExamSection");
    const sections = await RtseExamSection.getSections(examId);
    if (!sections.some(item => String(item.section_name).trim().toUpperCase() === normalizedSection)) {
        throw new Error("The section is not configured for this examination.");
    }

    const search = `%${String(keyword || "").trim()}%`;
    const [rows] = await db.query(
        `SELECT *
         FROM rtse_applications
         WHERE archive = 0
           AND status = 'Approved'
           AND application_year = ?
           AND section = ?
           AND exam_setting_id = ?
           AND (
             ? = '%%'
             OR registration_no LIKE ?
             OR full_name LIKE ?
             OR mobile LIKE ?
             OR school_name LIKE ?
             OR CAST(class AS CHAR) LIKE ?
             OR section LIKE ?
             OR roll_no LIKE ?
             OR CAST(roll_number AS CHAR) LIKE ?
           )
         ORDER BY
           CASE WHEN roll_no IS NULL THEN 1 ELSE 0 END,
           roll_no ASC,
           registration_no ASC`,
        [year, normalizedSection, examId, search, search, search, search,
         search, search, search, search, search]
    );
    return rows;
}

// Generate Admit Cards
// =====================================

static async generateAdmitCards(section, applicationYear, examSettingId) {
    const normalizedSection = String(section || "").trim().toUpperCase();
    const examId = Number(examSettingId);

    if (!normalizedSection || !Number.isInteger(Number(applicationYear))) {
        throw new Error("A valid section and application year are required.");
    }
    if (!Number.isInteger(examId) || examId <= 0) {
        throw new Error("A valid configured examination is required.");
    }

    const RtseExamSection = require("./RtseExamSection");
    const sections = await RtseExamSection.getSections(examId);
    if (!sections.some(item =>
        String(item.section_name || "").trim().toUpperCase() === normalizedSection
    )) {
        throw new Error("Section is not configured for this examination.");
    }

    const filters = [
        "archive = 0",
        "status = 'Approved'",
        "application_year = ?",
        "section = ?",
        "roll_no IS NOT NULL",
        "exam_setting_id = ?"
    ];
    const params = [applicationYear, normalizedSection, examId];

    await db.query(
        `UPDATE rtse_applications
         SET admit_generated = 1
         WHERE ${filters.join(" AND ")}`,
        params
    );
}

// =====================================
// Get Admit Card Students
// =====================================

static async getGeneratedAdmitCardStudents(section, applicationYear){
    const [rows] = await db.query(
        `
        SELECT *
        FROM rtse_applications
        WHERE
            archive = 0
            AND status = 'Approved'
            AND application_year = ?
            AND roll_no IS NOT NULL
            AND section = ?
            AND admit_generated = 1
        ORDER BY
            CAST(
                SUBSTRING_INDEX(roll_no, '-', -1)
                AS UNSIGNED
            ) ASC,
            roll_no ASC
        `,
        [applicationYear, section]
    );
    return rows;
}

// =====================================
// Get Generated Admit Cards For A Specific Examination
// Read-only query: does not modify student records.
static async getExamGeneratedAdmitCardStudents(
    section,
    applicationYear,
    examSettingId
) {
    const normalizedSection = String(section || "").trim().toUpperCase();
    const year = Number(applicationYear);
    const examId = Number(examSettingId);

    if (
        !normalizedSection ||
        !Number.isInteger(year) || year <= 0 ||
        !Number.isInteger(examId) || examId <= 0
    ) {
        throw new Error("A valid section, application year, and examination are required.");
    }

    const RtseExamSection = require("./RtseExamSection");
    const sections = await RtseExamSection.getSections(examId);

    if (!sections.some(item =>
        String(item.section_name || "").trim().toUpperCase() === normalizedSection
    )) {
        throw new Error("Section is not configured for this examination.");
    }

    const [rows] = await db.query(`
        SELECT *
        FROM rtse_applications
        WHERE archive = 0
          AND status = 'Approved'
          AND application_year = ?
          AND section = ?
          AND exam_setting_id = ?
          AND roll_no IS NOT NULL
          AND admit_generated = 1
        ORDER BY
          CAST(SUBSTRING_INDEX(roll_no, '-', -1) AS UNSIGNED) ASC,
          roll_no ASC
    `, [year, normalizedSection, examId]);

    return rows;
}

// Get Generated Admit Cards By School
// Uses the same normalized school-name grouping
// already used by the Invited Schools directory.
// No admit-card files are created or copied.
// =====================================
static async getGeneratedAdmitCardStudentsBySchool(
    schoolName,
    applicationYear,
    examSettingId
){
    const normalizedSchoolName =
        String(schoolName || "").trim();
    const normalizedYear = Number(applicationYear);
    const normalizedExamId = Number(examSettingId);

    if (!normalizedSchoolName) {
        return [];
    }

    if (!Number.isInteger(normalizedYear) || normalizedYear <= 0) {
        throw new Error("A valid examination year is required.");
    }

    if (!Number.isInteger(normalizedExamId) || normalizedExamId <= 0) {
        throw new Error("A valid examination ID is required.");
    }

    const [rows] = await db.query(
        `
        SELECT *
        FROM rtse_applications
        WHERE
            archive = 0
            AND status = 'Approved'
            AND application_year = ?
            AND exam_setting_id = ?
            AND roll_no IS NOT NULL
            AND admit_generated = 1
            AND school_name IS NOT NULL
            AND TRIM(school_name) <> ''
            AND LOWER(TRIM(school_name))
                COLLATE utf8mb4_unicode_ci =
                LOWER(TRIM(?))
                COLLATE utf8mb4_unicode_ci
        ORDER BY
            CAST(
                SUBSTRING_INDEX(roll_no, '-', -1)
                AS UNSIGNED
            ) ASC,
            roll_no ASC
        `,
        [
            normalizedYear,
            normalizedExamId,
            normalizedSchoolName
        ]
    );

    return rows;
}

static async getAllGeneratedAdmitCardStudents(applicationYear, examSettingId) {
    const normalizedYear = Number(applicationYear);
    const normalizedExamId = Number(examSettingId);

    if (!Number.isInteger(normalizedYear) || normalizedYear <= 0) {
        throw new Error("A valid examination year is required.");
    }

    if (!Number.isInteger(normalizedExamId) || normalizedExamId <= 0) {
        throw new Error("A valid examination ID is required.");
    }

    const [rows] = await db.query(
        `
        SELECT *
        FROM rtse_applications
        WHERE
            archive = 0
            AND status = 'Approved'
            AND application_year = ?
            AND exam_setting_id = ?
            AND roll_no IS NOT NULL
            AND admit_generated = 1
        ORDER BY
            section ASC,
            CAST(SUBSTRING_INDEX(roll_no, '-', -1) AS UNSIGNED) ASC,
            roll_no ASC
        `,
        [normalizedYear, normalizedExamId]
    );

    return rows;
}

static async searchApprovedSectionStudents(
    section,
    applicationYear,
    keyword = ""
){

    const normalizedSection =
        String(section || "").trim().toUpperCase();

    const normalizedYear =
        Number(applicationYear);

    const RtseExamSetting = require("./RtseExamSetting");
        const RtseExamSection = require("./RtseExamSection");
        const activeExam = await RtseExamSetting.get();
        const configuredSections = activeExam?.id
            ? await RtseExamSection.getSections(activeExam.id)
            : [];

        if (!configuredSections.some(
            item => String(item.section_name || "").trim().toUpperCase() === normalizedSection
        )) {
            throw new Error("Invalid RTSE section for the active examination.");
        }

    if(!normalizedYear){
        throw new Error("Invalid RTSE application year.");
    }

    const search =
        `%${String(keyword || "").trim()}%`;

    const [rows] = await db.query(
        `SELECT *
         FROM rtse_applications
         WHERE
            archive=0
            AND status='Approved'
            AND application_year=?
            AND section=?
            AND (
                ? = '%%'
                OR registration_no LIKE ?
                OR full_name LIKE ?
                OR mobile LIKE ?
                OR school_name LIKE ?
                OR CAST(class AS CHAR) LIKE ?
                OR section LIKE ?
                OR roll_no LIKE ?
                OR CAST(roll_number AS CHAR) LIKE ?
            )
         ORDER BY
            CASE
                WHEN roll_no IS NULL THEN 1
                ELSE 0
            END,
            roll_no ASC,
            registration_no ASC`,
        [
            normalizedYear,
            normalizedSection,
            search,
            search,
            search,
            search,
            search,
            search,
            search,
            search,
            search
        ]
    );

    return rows;
}


// =====================================
// Search Applications
// =====================================
static async search(keyword){

    keyword=`%${keyword}%`;

    const [rows]=await db.query(

        `SELECT *

         FROM rtse_applications

         WHERE

            archive=0

         AND

         (

            registration_no LIKE ?

            OR full_name LIKE ?

            OR school_name LIKE ?

            OR mobile LIKE ?

            OR roll_no LIKE ?

         )

         ORDER BY registration_no ASC`,

        [

            keyword,

            keyword,

            keyword,

            keyword,

            keyword

        ]

    );

    return rows;

}



// =====================================
// Reset Roll Numbers + Admit Cards
// Section Wise
// =====================================

static async resetExamSectionRollNumbers(section, applicationYear, examSettingId) {
        const normalizedSection = String(section || "").trim().toUpperCase();
        const normalizedYear = Number(applicationYear);
        const examId = Number(examSettingId);

        if (!Number.isInteger(examId) || examId <= 0) {
            throw new Error("Invalid examination setting ID.");
        }
        if (!Number.isInteger(normalizedYear) || normalizedYear <= 0) {
            throw new Error("Invalid RTSE application year.");
        }

        const sections = await RtseExamSection.getSections(examId);
        if (!sections.some(item =>
            String(item.section_name || "").trim().toUpperCase() === normalizedSection
        )) {
            throw new Error("Section is not configured for this examination.");
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [attendanceRows] = await connection.query(
                `SELECT COUNT(*) AS attendance_count
                 FROM rtse_exam_attendance ea
                 INNER JOIN rtse_applications a ON a.id = ea.application_id
                 WHERE a.archive = 0
                   AND a.status = 'Approved'
                   AND a.application_year = ?
                   AND a.exam_setting_id = ?
                   AND a.section = ?
                   AND ea.attendance_status = 'PRESENT'`,
                [normalizedYear, examId, normalizedSection]
            );

            if (Number(attendanceRows[0]?.attendance_count || 0) > 0) {
                const error = new Error(
                    "Cannot reset roll numbers because PRESENT attendance exists for this examination section and year."
                );
                error.code = "RTSE_ATTENDANCE_ALREADY_RECORDED";
                throw error;
            }

            await connection.query(
                `DELETE ea
                 FROM rtse_exam_attendance ea
                 INNER JOIN rtse_applications a ON a.id = ea.application_id
                 WHERE a.archive = 0
                   AND a.status = 'Approved'
                   AND a.application_year = ?
                   AND a.exam_setting_id = ?
                   AND a.section = ?
                   AND ea.attendance_status IN ('NOT_SCANNED', 'ABSENT')`,
                [normalizedYear, examId, normalizedSection]
            );

            const [result] = await connection.query(
                `UPDATE rtse_applications
                 SET roll_no = NULL,
                     roll_number = NULL,
                     admit_generated = 0
                 WHERE archive = 0
                   AND status = 'Approved'
                   AND application_year = ?
                   AND exam_setting_id = ?
                   AND section = ?`,
                [normalizedYear, examId, normalizedSection]
            );

            await connection.commit();
            return {
                section: normalizedSection,
                applicationYear: normalizedYear,
                examSettingId: examId,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Exam-section roll reset rollback error:", rollbackError);
            }
            throw error;
        } finally {
            connection.release();
        }
    }

    // Reset admit-card status without deleting attendance records.
    static async resetExamSectionAdmitCards(section, applicationYear, examSettingId) {
        const normalizedSection = String(section || "").trim().toUpperCase();
        const normalizedYear = Number(applicationYear);
        const examId = Number(examSettingId);

        if (!Number.isInteger(examId) || examId <= 0) {
            throw new Error("Invalid examination setting ID.");
        }
        if (!Number.isInteger(normalizedYear) || normalizedYear <= 0) {
            throw new Error("Invalid RTSE application year.");
        }

        const sections = await RtseExamSection.getSections(examId);
        if (!sections.some(item =>
            String(item.section_name || "").trim().toUpperCase() === normalizedSection
        )) {
            throw new Error("Section is not configured for this examination.");
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [attendanceRows] = await connection.query(
                `SELECT COUNT(*) AS attendance_count
                 FROM rtse_exam_attendance ea
                 INNER JOIN rtse_applications a ON a.id = ea.application_id
                 WHERE a.archive = 0
                   AND a.status = 'Approved'
                   AND a.application_year = ?
                   AND a.exam_setting_id = ?
                   AND a.section = ?
                   AND ea.attendance_status = 'PRESENT'`,
                [normalizedYear, examId, normalizedSection]
            );

            if (Number(attendanceRows[0]?.attendance_count || 0) > 0) {
                const error = new Error(
                    "Cannot reset admit-card status because PRESENT attendance exists for this examination section and year."
                );
                error.code = "RTSE_ATTENDANCE_ALREADY_RECORDED";
                throw error;
            }

            const [result] = await connection.query(
                `UPDATE rtse_applications
                 SET admit_generated = 0
                 WHERE archive = 0
                   AND status = 'Approved'
                   AND application_year = ?
                   AND exam_setting_id = ?
                   AND section = ?
                   AND roll_no IS NOT NULL`,
                [normalizedYear, examId, normalizedSection]
            );

            await connection.commit();
            return {
                section: normalizedSection,
                applicationYear: normalizedYear,
                examSettingId: examId,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Exam-section admit reset rollback error:", rollbackError);
            }
            throw error;
        } finally {
            connection.release();
        }
    }


static async getSectionStatistics(examSettingId) {
    const examId = Number(examSettingId);

    if (!Number.isInteger(examId) || examId <= 0) {
        throw new Error("A valid examination setting ID is required.");
    }

    const examWhere = " AND exam_setting_id = ?";

    const [rows] = await db.query(
        `SELECT
            section,
            COUNT(*) total,
            SUM(status='Approved') approved,
            SUM(status='Pending') pending,
            SUM(status='Rejected') rejected,
            SUM(status='Approved' AND gender='Male') approved_male,
            SUM(status='Approved' AND gender='Female') approved_female,
            SUM(status='Approved' AND roll_no IS NOT NULL) roll_generated,
            SUM(status='Approved' AND admit_generated=1) admit_generated,
            SUM(status='Approved' AND admit_generated=1 AND omr_generated=1) omr_generated
        FROM rtse_applications
        WHERE archive=0${examWhere}
        GROUP BY section
        ORDER BY section`,
        [examId]
    );

    return rows;
}


// =====================================

    // =====================================
    // Independent OMR Generation State
    // =====================================

    static async getSectionOmrStatus(section, applicationYear, examSettingId) {
        const normalizedSection = String(section || "").trim().toUpperCase();
        const year = Number(applicationYear);
        const examId = Number(examSettingId);

        if (
            !normalizedSection ||
            !Number.isInteger(year) || year <= 0 ||
            !Number.isInteger(examId) || examId <= 0
        ) {
            throw new Error("A valid section, application year, and examination are required.");
        }

        const [rows] = await db.query(
            `SELECT
                COUNT(*) AS eligible,
                COALESCE(SUM(omr_generated = 1), 0) AS omr_generated
             FROM rtse_applications
             WHERE archive = 0
               AND status = 'Approved'
               AND application_year = ?
               AND section = ?
               AND exam_setting_id = ?
               AND roll_no IS NOT NULL
               AND admit_generated = 1`,
            [year, normalizedSection, examId]
        );

        return rows[0] || {
            eligible: 0,
            omr_generated: 0
        };
    }

    static async markOmrGeneratedForSection(section, applicationYear, examSettingId) {
        const normalizedSection = String(section || "").trim().toUpperCase();
        const year = Number(applicationYear);
        const examId = Number(examSettingId);

        if (
            !normalizedSection ||
            !Number.isInteger(year) || year <= 0 ||
            !Number.isInteger(examId) || examId <= 0
        ) {
            throw new Error("A valid section, application year, and examination are required.");
        }

        await db.query(
            `UPDATE rtse_applications
             SET omr_generated = 1
             WHERE archive = 0
               AND status = 'Approved'
               AND application_year = ?
               AND section = ?
               AND exam_setting_id = ?
               AND roll_no IS NOT NULL
               AND admit_generated = 1`,
            [year, normalizedSection, examId]
        );
    }

    static async resetOmrForSection(section, applicationYear, examSettingId) {
        const normalizedSection = String(section || "").trim().toUpperCase();
        const year = Number(applicationYear);
        const examId = Number(examSettingId);

        if (
            !normalizedSection ||
            !Number.isInteger(year) || year <= 0 ||
            !Number.isInteger(examId) || examId <= 0
        ) {
            throw new Error("A valid section, application year, and examination are required.");
        }

        await db.query(
            `UPDATE rtse_applications
             SET omr_generated = 0
             WHERE archive = 0
               AND status = 'Approved'
               AND application_year = ?
               AND section = ?
               AND exam_setting_id = ?`,
            [year, normalizedSection, examId]
        );
    }

// Update Application
// =====================================
    static async update(id, data, photoFilename = null) {
        // Recalculate section automatically from the updated class.
        // Photo is changed only when the admin explicitly supplies
        // a newly compressed replacement filename.
        // identity_document is intentionally never changed here.
        let section;

        // Use the existing examination mapping when this application
        // is associated with a configured examination.
               const [examColumnRows] = await db.query(`
            SELECT COUNT(*) AS has_application_exam_column
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'rtse_applications'
              AND column_name = 'exam_setting_id'
        `);


        if (Number(examColumnRows[0]?.has_application_exam_column) > 0) {
                        const [applicationRows] = await db.query(
                `SELECT exam_setting_id
                 FROM rtse_applications
                 WHERE id=?
                 LIMIT 1`,
                [id]
            );

            if (!applicationRows.length) {
                throw new Error("Application not found.");
            }

            const examSettingId = Number(
                applicationRows[0].exam_setting_id
            );

            if (Number.isInteger(examSettingId) && examSettingId > 0) {
                section = await RtseExamSection.getSectionForClass(
                    examSettingId,
                    data.class
                );

                if (!section) {
                    throw new Error(
                        "Class is not configured for this examination."
                    );
                }
            } else {
                throw new Error(
                    "Application is not linked to an examination. Link it to a configured examination before updating its class."
                );
            }
        } else {
            throw new Error("Legacy section mapping is disabled; link this application to a configured examination.");
        }

        const schoolId = Number(data.school_id);

        if (!Number.isInteger(schoolId) || schoolId <= 0) {
            throw new Error("Invalid registered school selected.");
        }

        const [schoolRows] = await db.query(
            `SELECT id, school_name
             FROM arsp_schools
             WHERE id=?
               AND status="Approved"
             LIMIT 1`,
            [schoolId]
        );

        if (!schoolRows.length) {
            throw new Error("Selected registered school is not approved or does not exist.");
        }

        const school = schoolRows[0];

        const updateFields = [
        "full_name=?",
        "father_name=?",
        "mother_name=?",
        "gender=?",
        "dob=?",
        "mobile=?",
        "email=?",
        "school_id=?",
        "school_name=?",
        "district=?",
        "state=?",
        "pincode=?",
        "class=?",
        "section=?",
        "address=?",
        "status=?"
    ];

    const updateValues = [
        data.full_name,
        data.father_name,
        data.mother_name,
        data.gender,
        data.dob,
        data.mobile,
        data.email,
        school.id,
        school.school_name,
        data.district,
        data.state,
        data.pincode,
        data.class,
        section,
        data.address,
        data.status
    ];

    if (photoFilename) {
        updateFields.push("photo=?");
        updateValues.push(photoFilename);
    }

    updateValues.push(id);

    await db.query(
        `UPDATE rtse_applications
         SET ${updateFields.join(", ")}
         WHERE id=?`,
        updateValues
    );
    }




    // =====================================
    // School Portal - RTSE Student Registry
    // =====================================

    // =====================================
    // School RTSE Dashboard Statistics
    // =====================================
    static async getSchoolRtseStats(schoolId) {
        const schoolCondition = `
            archive=0
            AND (
                school_id=?
                OR (
                    school_id IS NULL
                    AND LOWER(TRIM(school_name)) COLLATE utf8mb4_unicode_ci = LOWER(
                        (
                            SELECT TRIM(school_name) COLLATE utf8mb4_unicode_ci
                            FROM arsp_schools
                            WHERE id=?
                            LIMIT 1
                        )
                    )
                )
            )
        `;

        const [rows] = await db.query(
            `
            SELECT
                COUNT(*) AS all_students,
                COALESCE(SUM(status='Pending'), 0) AS pending,
                COALESCE(SUM(status='Approved'), 0) AS approved,
                COALESCE(SUM(status='Rejected'), 0) AS rejected
            FROM rtse_applications
            WHERE ${schoolCondition}
            `,
            [schoolId, schoolId]
        );

        const [sectionRows] = await db.query(
            `
            SELECT UPPER(TRIM(section)) AS section_name, COUNT(*) AS student_count
            FROM rtse_applications
            WHERE ${schoolCondition}
              AND TRIM(COALESCE(section, '')) <> ''
            GROUP BY UPPER(TRIM(section))
            `,
            [schoolId, schoolId]
        );

        const section_counts = {};
        for (const row of sectionRows) {
            section_counts[String(row.section_name || '').toUpperCase()] =
                Number(row.student_count || 0);
        }

        return {
            all_students: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            ...(rows[0] || {}),
            section_counts
        };
    }


    // Get School Student By ID
    // School ownership is enforced by school_id
    // =====================================

    static async getSchoolStudentById(studentId, schoolId) {

        const [rows] = await db.query(
            `
            SELECT *
            FROM rtse_applications
            WHERE id=?
              AND archive=0
              AND (
                    school_id=?
                    OR (
                        school_id IS NULL
                        AND LOWER(TRIM(school_name)) COLLATE utf8mb4_unicode_ci = LOWER(
                            (
                                SELECT TRIM(school_name) COLLATE utf8mb4_unicode_ci
                                FROM arsp_schools
                                WHERE id=?
                                LIMIT 1
                            )
                        )
                    )
              )
            LIMIT 1
            `,
            [
                studentId,
                schoolId,
                schoolId
            ]
        );

        return rows[0] || null;
    }


    // =====================================
    // Update School Student
    // IMPORTANT:
    // school_id and school_name are NEVER updated
    // =====================================

    static async updateSchoolStudent(
        studentId,
        schoolId,
        data
    ) {

        const existingStudent = await this.getSchoolStudentById(
            studentId,
            schoolId
        );
        if (!existingStudent) {
            return false;
        }

        const [examColumnRows] = await db.query(`
            SELECT COUNT(*) AS has_exam_column
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'rtse_applications'
              AND column_name = 'exam_setting_id'
        `);

        let examSettingId = Number(existingStudent.exam_setting_id);
        if (Number(examColumnRows[0]?.has_exam_column) > 0) {
            if (!Number.isInteger(examSettingId) || examSettingId <= 0) {
                throw new Error("Student is not linked to an examination.");
            }
        } else {
            const activeExam = await RtseExamSetting.getActive();
            examSettingId = Number(activeExam?.id);
            if (!Number.isInteger(examSettingId) || examSettingId <= 0) {
                throw new Error("No active RTSE examination is configured.");
            }
        }
        const mappedSection = await RtseExamSection.getSectionForClass(
            examSettingId,
            data.class
        );
        if (!mappedSection || String(data.section || "") !== String(mappedSection)) {
            throw new Error("Class and section do not match the active examination mapping.");
        }

        const [result] = await db.query(
            `
            UPDATE rtse_applications
            SET
                full_name=?,
                father_name=?,
                mother_name=?,
                gender=?,
                dob=?,
                mobile=?,
                email=?,
                district=?,
                state=?,
                pincode=?,
                class=?,
                section=?,
                address=?
            WHERE id=?
              AND archive=0
              AND (
                    school_id=?
                    OR (
                        school_id IS NULL
                        AND LOWER(TRIM(school_name)) COLLATE utf8mb4_unicode_ci = LOWER(
                            (
                                SELECT TRIM(school_name) COLLATE utf8mb4_unicode_ci
                                FROM arsp_schools
                                WHERE id=?
                                LIMIT 1
                            )
                        )
                    )
              )
            `,
            [
                data.full_name,
                data.father_name,
                data.mother_name,
                data.gender,
                data.dob,
                data.mobile,
                data.email,
                data.district,
                data.state,
                data.pincode,
                data.class,
                mappedSection,
                data.address,
                studentId,
                schoolId,
                schoolId
            ]
        );

        return result.affectedRows > 0;
    }

    static async getSchoolStudents(
        schoolId,
        search = "",
        status = "",
        section = ""
    ) {
        const keyword = String(search || "").trim();
        const selectedStatus = String(status || "").trim();
        const selectedSection = String(section || "").trim().toUpperCase();

        const params = [schoolId, schoolId];

        let sql = `
            SELECT
                id,
                registration_no,
                full_name,
                father_name,
                mobile,
                email,
                school_id,
                school_name,
                class,
                section,
                district,
                status,
                roll_no,
                roll_number,
                admit_generated,
                application_year
            FROM rtse_applications
            WHERE archive=0
              AND (
                    school_id=?
                    OR (
                        school_id IS NULL
                        AND LOWER(TRIM(school_name)) COLLATE utf8mb4_unicode_ci = LOWER(
                            (
                                SELECT TRIM(school_name) COLLATE utf8mb4_unicode_ci
                                FROM arsp_schools
                                WHERE id=?
                                LIMIT 1
                            )
                        )
                    )
              )
        `;

        if (["Pending", "Approved", "Rejected"].includes(selectedStatus)) {
            sql += ` AND status=?`;
            params.push(selectedStatus);
        }

        if (selectedSection) {
            sql += ` AND UPPER(TRIM(section))=?`;
            params.push(selectedSection);
        }

        if (keyword) {
            const like = `%${keyword}%`;

            sql += `
                AND (
                    registration_no LIKE ?
                    OR full_name LIKE ?
                    OR mobile LIKE ?
                    OR CAST(class AS CHAR) LIKE ?
                    OR section LIKE ?
                    OR status LIKE ?
                    OR roll_no LIKE ?
                    OR CAST(roll_number AS CHAR) LIKE ?
                )
            `;

            params.push(
                like, like, like, like,
                like, like, like, like
            );
        }

        sql += `
            ORDER BY
                class ASC,
                full_name ASC,
                registration_no ASC
        `;

        const [rows] = await db.query(sql, params);
        return rows;
    }

}



module.exports = RtseApplication;
