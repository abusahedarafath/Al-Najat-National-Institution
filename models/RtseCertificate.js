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
                r.overall_rank

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
    // Get All Certificates
    // =====================================

    static async getAll(){

        const [rows]=await db.query(

            `SELECT *

             FROM rtse_certificates

             ORDER BY id DESC`

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
            r.overall_rank

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

static async search(keyword){

    const [rows] = await db.query(

        `SELECT

            c.*,

            a.registration_no,
            a.roll_no,
            a.full_name,
            a.photo

         FROM rtse_certificates c

         INNER JOIN rtse_applications a

            ON a.id=c.application_id

         WHERE

            a.registration_no=?

         OR

            a.roll_no=?`,

        [

            keyword,

            keyword

        ]

    );

    return rows[0];

}




// =====================================
// Students Without Certificate
// =====================================

static async getPendingStudents(section = null){

    let sql = `

        SELECT

            a.id

        FROM rtse_applications a

        INNER JOIN rtse_results r

            ON r.application_id = a.id

        LEFT JOIN rtse_certificates c

            ON c.application_id = a.id

        WHERE

            r.result_status='Pass'

        AND

            c.id IS NULL

    `;

    const params = [];

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

static async getBySection(section){

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

        ORDER BY

            a.roll_no ASC`,

        [

            section

        ]

    );

    return rows;

}

}

module.exports = RtseCertificate;
