const db = require("../config/database");

class RtseResult {

    // =====================================
    // Save Result
    // =====================================

    static async save(data){

        await db.query(

            `INSERT INTO rtse_results(

                application_id,
                marks,
                percentage,
                grade,
                rank_no,
                result_status

            )

            VALUES(?,?,?,?,?,?)`

            ,

            [

                data.application_id,
                data.marks,
                data.percentage,
                data.grade,
                data.rank_no,
                'Entered'

            ]

        );

    }


    // =====================================
    // Update Result
    // =====================================

    static async update(id,data){

        await db.query(

            `UPDATE rtse_results

             SET

                marks=?,
                percentage=?,
                grade=?,
                rank_no=?,
                result_status=?

             WHERE application_id=?`

            ,

            [

                data.marks,
                data.percentage,
                data.grade,
                data.rank_no,
                'Entered',

                id

            ]

        );

    }


    // =====================================
    // Delete / Reset Result to Pending
    // =====================================

    static async deleteByApplication(id){

        await db.query(

            `DELETE FROM rtse_results
             WHERE application_id=?`,

            [
                id
            ]

        );

    }


    // =====================================
    // Student Result
    // =====================================

    static async getByApplication(id){

        const [rows]=await db.query(

            `SELECT

                r.*,

                a.registration_no,
                a.roll_no,
                a.full_name,
                a.school_name,
                a.section,
                a.class

             FROM rtse_results r

             JOIN rtse_applications a

             ON r.application_id=a.id

             WHERE r.application_id=?`

            ,

            [

                id

            ]

        );

        return rows[0];

    }


    // =====================================
    // All Results
    // =====================================

    static async getAll(){

        const [rows]=await db.query(

            `SELECT

                r.*,

                a.registration_no,
                a.roll_no,
                a.full_name,
                a.school_name,
                a.section

            FROM rtse_results r

            JOIN rtse_applications a

            ON r.application_id=a.id

            ORDER BY

                r.rank_no ASC`

        );

        return rows;

    }




// =====================================
// Result Dashboard
// =====================================

static async getDashboardResults(
    search = "",
    section = "",
    resultFilter = ""
){

    search = String(search || "").trim();
    section = String(section || "").trim();
    resultFilter = String(resultFilter || "").trim();

    let sql = `
        SELECT

            a.id AS application_id,
            a.registration_no,
            a.roll_no,
            a.full_name,
            a.school_name,
            a.section,
            a.class,
            a.status AS application_status,
            a.admit_generated,

            r.id AS result_id,
            r.marks,
            r.percentage,
            r.grade,
            r.result_status,
            r.section_rank,
            r.overall_rank

        FROM rtse_applications a

        INNER JOIN rtse_exam_attendance ea
            ON ea.application_id = a.id
            AND ea.attendance_status = 'PRESENT'

        LEFT JOIN rtse_results r
            ON r.application_id = a.id

        WHERE
            a.archive = 0
            AND a.status = 'Approved'
            AND a.admit_generated = 1
    `;

    const params = [];

    if (search) {

        sql += `
            AND (
                a.registration_no LIKE ?
                OR a.roll_no LIKE ?
                OR a.full_name LIKE ?
                OR a.school_name LIKE ?
            )
        `;

        const keyword = `%${search}%`;

        params.push(
            keyword,
            keyword,
            keyword,
            keyword
        );
    }

    if (section) {

        sql += `
            AND a.section = ?
        `;

        params.push(section);
    }

    if (resultFilter === "Pending") {

        sql += `
            AND r.id IS NULL
        `;

    } else if (resultFilter === "Entered") {

        sql += `
            AND r.id IS NOT NULL
        `;

    }

    sql += `
        ORDER BY
            a.section ASC,
            CASE
                WHEN r.overall_rank IS NULL THEN 999999
                ELSE r.overall_rank
            END ASC,
            a.roll_no ASC,
            a.full_name ASC
    `;

    const [rows] = await db.query(
        sql,
        params
    );

    return rows;
}


// =====================================
// Generate Section-wise Rank
// =====================================

static async generateSectionRanks(section){

    const [students] = await db.query(

        `SELECT

            r.id,
            r.marks

        FROM rtse_results r

        INNER JOIN rtse_applications a

            ON a.id=r.application_id

        WHERE

            a.section=?

        AND r.id IS NOT NULL

        ORDER BY

            r.marks DESC,

            a.full_name ASC`,

        [

            section

        ]

    );

    let rank=1;

    for(const student of students){

        await db.query(

            `UPDATE rtse_results

             SET section_rank=?

             WHERE id=?`,

            [

                rank,

                student.id

            ]

        );

        rank++;

    }

}



// =====================================
// Generate Overall Rank
// =====================================

static async generateOverallRank(){

    const [students] = await db.query(

        `SELECT

            r.id,
            r.marks

        FROM rtse_results r

        INNER JOIN rtse_applications a

            ON a.id=r.application_id

        WHERE r.id IS NOT NULL

        ORDER BY

            r.marks DESC,

            a.full_name ASC`

    );

    let rank=1;

    for(const student of students){

        await db.query(

            `UPDATE rtse_results

             SET overall_rank=?

             WHERE id=?`,

            [

                rank,

                student.id

            ]

        );

        rank++;

    }

}

// =====================================
// Overall Merit List
// =====================================

static async getOverallMeritList(){

    const [rows] = await db.query(

        `SELECT

            r.*,

            a.registration_no,
            a.roll_no,
            a.full_name,
            a.school_name,
            a.section,
            a.class,
            a.district

        FROM rtse_results r

        INNER JOIN rtse_applications a

            ON a.id=r.application_id

        WHERE r.id IS NOT NULL

        ORDER BY

            r.overall_rank ASC`

    );

    return rows;

}



// =====================================
// Section Merit List
// =====================================

static async getSectionMeritList(section){

    const [rows] = await db.query(

        `SELECT

            r.*,

            a.registration_no,
            a.roll_no,
            a.full_name,
            a.school_name,
            a.section,
            a.class,
            a.district

        FROM rtse_results r

        INNER JOIN rtse_applications a

            ON a.id=r.application_id

        WHERE

            a.section=?

        AND r.id IS NOT NULL

        ORDER BY

            r.section_rank ASC`,

        [

            section

        ]

    );

    return rows;

}


// =====================================
// Search Result
// =====================================

static async searchResult(keyword){

    const [rows]=await db.query(

        `SELECT

            r.*,

            a.*

        FROM rtse_results r

        INNER JOIN rtse_applications a

        ON a.id=r.application_id

        WHERE

            a.registration_no=?

        OR

            a.roll_no=?`

        ,

        [

            keyword,

            keyword

        ]

    );

    return rows[0];

}

}

module.exports = RtseResult;

