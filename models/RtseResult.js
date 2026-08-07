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
                data.result_status

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
                data.result_status,

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

        AND

            r.result_status='Pass'

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

        WHERE

            r.result_status='Pass'

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

        WHERE

            r.result_status='Pass'

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

        AND

            r.result_status='Pass'

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

