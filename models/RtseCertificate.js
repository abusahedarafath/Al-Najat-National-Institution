const db = require("../config/database");

class RtseCertificate {

    // =====================================
    // Generate Certificate
    // =====================================

    static async generate(data){

        await db.query(

            `INSERT INTO rtse_certificates(

                application_id,
                certificate_no,
                certificate_type,
                issue_date,
                qr_code

            )

            VALUES(?,?,?,?,?)`,

            [

                data.application_id,
                data.certificate_no,
                data.certificate_type,
                data.issue_date,
                data.qr_code

            ]

        );

    }



// =====================================
// Check Existing Certificate
// =====================================

static async exists(applicationId){

    const [rows] = await db.query(

        `SELECT id

         FROM rtse_certificates

         WHERE application_id=?`,

        [

            applicationId

        ]

    );

    return rows.length>0;

}






    // =====================================
    // Get Certificate
    // =====================================

    static async getByApplication(id){

        const [rows]=await db.query(

            `SELECT

                c.*,

                a.registration_no,
                a.roll_no,
                a.full_name,
                a.father_name,
                a.school_name,
                a.section,
                a.photo,

                r.marks,
                r.percentage,
                r.grade,
                r.section_rank,
                r.overall_rank,

                (
                    SELECT rcm.marks
                    FROM rtse_result_component_marks rcm
                    INNER JOIN rtse_mark_components mc
                        ON mc.id=rcm.component_id
                    WHERE rcm.result_id=r.id
                      AND LOWER(REPLACE(mc.name,' ','')) LIKE '%writingskill%'
                    ORDER BY mc.display_order ASC, mc.id ASC
                    LIMIT 1
                ) AS writing_skill_marks,

                (
                    SELECT mc.maximum_marks
                    FROM rtse_result_component_marks rcm
                    INNER JOIN rtse_mark_components mc
                        ON mc.id=rcm.component_id
                    WHERE rcm.result_id=r.id
                      AND LOWER(REPLACE(mc.name,' ','')) LIKE '%writingskill%'
                    ORDER BY mc.display_order ASC, mc.id ASC
                    LIMIT 1
                ) AS writing_skill_maximum_marks

            FROM rtse_certificates c

            INNER JOIN rtse_applications a

                ON a.id=c.application_id

            INNER JOIN rtse_results r

                ON r.application_id=a.id

            WHERE

                c.application_id=?`,

            [

                id

            ]

        );

        return rows[0];

    }


    // =====================================
    // Update Certificate QR Code
    // =====================================

    static async updateQrCode(applicationId, qrCode){

        await db.query(

            `UPDATE rtse_certificates
             SET qr_code=?
             WHERE application_id=?`,

            [
                qrCode,
                applicationId
            ]

        );

    }



    // =====================================
    // Get All Certificates
    // =====================================

    static async getAll(applicationYear = null){

    let sql = `
        SELECT
            c.*,
            a.registration_no,
            a.roll_no,
            a.full_name,
            a.father_name,
            a.school_name,
            a.section,
            a.photo,
            r.section_rank,
            r.overall_rank
        FROM rtse_certificates c
        INNER JOIN rtse_applications a
            ON a.id=c.application_id
        INNER JOIN rtse_results r
            ON r.application_id=a.id
    `;

    const params = [];

    sql += " WHERE r.section_rank >= 11";

    if(applicationYear){
        sql += " AND a.application_year=?";
        params.push(applicationYear);
    }

    sql += " ORDER BY c.id DESC";

    const [rows]=await db.query(
        sql,
        params
    );

    return rows;
}


// =====================================
// Find Certificate by Certificate Number
// =====================================

static async getByCertificateNumber(certificateNo){

    const [rows] = await db.query(

        `SELECT

            c.*,

            a.registration_no,
            a.roll_no,
            a.full_name,
            a.father_name,
            a.school_name,
            a.district,
            a.section,
            a.photo,

            r.marks,
            r.percentage,
            r.grade,
            r.section_rank,
            r.overall_rank,

            (
                SELECT rcm.marks
                FROM rtse_result_component_marks rcm
                INNER JOIN rtse_mark_components mc
                    ON mc.id=rcm.component_id
                WHERE rcm.result_id=r.id
                  AND LOWER(REPLACE(mc.name,' ','')) LIKE '%writingskill%'
                ORDER BY mc.display_order ASC, mc.id ASC
                LIMIT 1
            ) AS writing_skill_marks,

            (
                SELECT mc.maximum_marks
                FROM rtse_result_component_marks rcm
                INNER JOIN rtse_mark_components mc
                    ON mc.id=rcm.component_id
                WHERE rcm.result_id=r.id
                  AND LOWER(REPLACE(mc.name,' ','')) LIKE '%writingskill%'
                ORDER BY mc.display_order ASC, mc.id ASC
                LIMIT 1
            ) AS writing_skill_maximum_marks

        FROM rtse_certificates c

        INNER JOIN rtse_applications a

            ON a.id=c.application_id

        INNER JOIN rtse_results r

            ON r.application_id=a.id

        WHERE

            c.certificate_no=?`,

        [

            certificateNo

        ]

    );

    return rows[0];

}


// =====================================
// Search Certificate
// =====================================

static async search(keyword, applicationYear = null){

    let sql = `
        SELECT
            c.*,
            a.registration_no,
            a.roll_no,
            a.full_name,
            a.photo
        FROM rtse_certificates c
        INNER JOIN rtse_applications a
            ON a.id=c.application_id
        WHERE
            (
                a.registration_no=?
                OR
                a.roll_no=?
            )
    `;

    const params = [
        keyword,
        keyword
    ];

    if(applicationYear){
        sql += " AND a.application_year=?";
        params.push(applicationYear);
    }

    sql += " ORDER BY c.id DESC LIMIT 1";

    const [rows] = await db.query(
        sql,
        params
    );

    return rows[0];
}


// =====================================
// Students Without Certificate
// =====================================

static async getPendingStudents(section = null, applicationYear = null){

    let sql = `

        SELECT

            a.id

        FROM rtse_applications a

        INNER JOIN rtse_results r

            ON r.application_id = a.id

        LEFT JOIN rtse_certificates c

            ON c.application_id = a.id

        WHERE

              a.application_year=?

            AND r.id IS NOT NULL

            AND r.section_rank >= 11

        AND

            c.id IS NULL

    `;

    const params = [applicationYear];

    if(section){

        sql += " AND a.section=?";

        params.push(section);

    }

    const [rows] = await db.query(

        sql,

        params

    );

    return rows;

}

// =====================================
// Get Certificates by Section
// =====================================

// =====================================
// Reset Certificates by Section
// =====================================

static async resetBySection(section, applicationYear){

    await db.query(

        `DELETE c
         FROM rtse_certificates c
         INNER JOIN rtse_applications a
             ON a.id=c.application_id
         INNER JOIN rtse_results r
             ON r.application_id=a.id
         WHERE
             a.section=?
             AND a.application_year=?
             AND r.section_rank >= 11`,

        [
            section,
            applicationYear
        ]

    );

}


// =====================================
// Reset All Certificates
// =====================================

static async resetAll(applicationYear){

    await db.query(

        `DELETE c
         FROM rtse_certificates c
         INNER JOIN rtse_applications a
             ON a.id=c.application_id
         INNER JOIN rtse_results r
             ON r.application_id=a.id
         WHERE
             a.application_year=?
             AND r.section_rank >= 11`,

        [
            applicationYear
        ]

    );

}


// =====================================
// Get Certificates by Section
// =====================================

static async getBySection(section, applicationYear){

    const [rows] = await db.query(

        `SELECT

            c.*,

            a.registration_no,
            a.roll_no,
            a.full_name,
            a.father_name,
            a.school_name,
            a.section,
            a.photo,

            r.marks,
            r.percentage,
            r.grade,
            r.section_rank,
            r.overall_rank

        FROM rtse_certificates c

        INNER JOIN rtse_applications a

            ON a.id=c.application_id

        INNER JOIN rtse_results r

            ON r.application_id=a.id

        WHERE

            a.section=?

          AND a.application_year=?

            AND r.section_rank >= 11

        ORDER BY

            r.section_rank ASC`,

        [

            section

        ,
              applicationYear
          ]

    );

    return rows;

}

}

module.exports = RtseCertificate;
