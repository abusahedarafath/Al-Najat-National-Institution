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
    // Student Result using transaction connection
    // =====================================
    static async getByApplicationWithConnection(connection, id){
        const [rows] = await connection.query(
            `SELECT
                r.*,
                a.registration_no,
                a.roll_no,
                a.full_name,
                a.school_name,
                a.section,
                a.class,
                a.application_year
             FROM rtse_results r
             JOIN rtse_applications a
             ON r.application_id=a.id
             WHERE r.application_id=?`,
            [id]
        );

        return rows[0];
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
                a.class,
                a.application_year

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
    resultFilter = "",
    applicationYear = null
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
            a.father_name,
            a.mother_name,
            a.gender,
            a.dob,
            a.mobile,
            a.email,
            a.school_id,
            a.district,
            a.state,
            a.section,
            a.class,
            a.shift_id,
            a.room_id,
            a.seat_id,
            a.roll_number,
            a.room_no,
            a.seat_no,
            a.application_year,
            a.pincode,
            a.address,
            a.status AS application_status,
            a.admit_generated,

            r.id AS result_id,
            r.marks,
            r.total_marks,
            r.total_full_marks,
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
              AND a.application_year = ?
    `;

    const params = [applicationYear];

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

static async generateSectionRanks(section, applicationYear){

    const [students] = await db.query(

        `SELECT

            r.id,

            CASE
                WHEN r.total_marks IS NULL
                    THEN r.marks
                ELSE r.total_marks
            END AS ranking_marks

        FROM rtse_results r

        INNER JOIN rtse_applications a

            ON a.id=r.application_id

        WHERE

            a.section=?
          AND a.application_year=?

        AND r.id IS NOT NULL

        ORDER BY

            ranking_marks DESC,
            a.full_name ASC`,

        [
              section,
              applicationYear
          ]

    );

    let rank=1;
    let previousMarks=null;

    for(let index=0; index<students.length; index++){

        const student=students[index];

        if(
            index===0
        ){
            rank=1;
        }else if(
            Number(student.ranking_marks)!==
            Number(previousMarks)
        ){
            rank++;
        }

        await db.query(
            `UPDATE rtse_results
             SET section_rank=?
             WHERE id=?`,
            [
                rank,
                student.id
            ]
        );

        previousMarks=student.ranking_marks;
    }

}


// =====================================
// Ranking State Helpers
// =====================================

static async hasGeneratedRankings(applicationYear){

    const [rows] = await db.query(

        `SELECT COUNT(*) AS total

         FROM rtse_results r

         INNER JOIN rtse_applications a

             ON a.id=r.application_id

         WHERE a.application_year=?

           AND r.id IS NOT NULL

           AND (
               r.overall_rank IS NOT NULL
               OR r.section_rank IS NOT NULL
           )`,

        [applicationYear]

    );

    return Number(rows?.[0]?.total || 0) > 0;

}


static async resetRankings(applicationYear){

    await db.query(

        `UPDATE rtse_results r

         INNER JOIN rtse_applications a

             ON a.id=r.application_id

         SET
             r.section_rank=NULL,
             r.overall_rank=NULL

         WHERE a.application_year=?

           AND r.id IS NOT NULL`,

        [applicationYear]

    );

}


// Generate Overall Rank
// =====================================

static async generateOverallRank(applicationYear){

    const [students] = await db.query(

        `SELECT

            r.id,

            CASE
                WHEN r.total_marks IS NULL
                    THEN r.marks
                ELSE r.total_marks
            END AS ranking_marks

        FROM rtse_results r

        INNER JOIN rtse_applications a

            ON a.id=r.application_id

        WHERE a.application_year=?
          AND r.id IS NOT NULL

        ORDER BY

            ranking_marks DESC,
            a.full_name ASC`

    ,

          [applicationYear]

      );

    let rank=1;
    let previousMarks=null;

    for(let index=0; index<students.length; index++){

        const student=students[index];

        if(
            index===0
        ){
            rank=1;
        }else if(
            Number(student.ranking_marks)!==
            Number(previousMarks)
        ){
            rank++;
        }

        await db.query(
            `UPDATE rtse_results
             SET overall_rank=?
             WHERE id=?`,
            [
                rank,
                student.id
            ]
        );

        previousMarks=student.ranking_marks;
    }

}

// =====================================
// Overall Merit List
// =====================================

static async getOverallMeritList(applicationYear){

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

        WHERE a.application_year=?
          AND r.id IS NOT NULL

        ORDER BY

            r.overall_rank ASC`

    ,

          [applicationYear]

      );

    if(!rows.length){
        return rows;
    }

    const resultIds = rows
        .map(row => Number(row.id))
        .filter(id => Number.isInteger(id) && id > 0);

    if(!resultIds.length){
        return rows;
    }

    const placeholders = resultIds.map(() => "?").join(",");

    const [componentRows] = await db.query(

        `SELECT

            rcm.result_id,
            rcm.component_id,
            rcm.marks

        FROM rtse_result_component_marks rcm

        INNER JOIN rtse_mark_components mc

            ON mc.id=rcm.component_id

        WHERE rcm.result_id IN (${placeholders})
          AND mc.application_year=?
          AND mc.enabled=1

        ORDER BY

            mc.display_order ASC,
            mc.id ASC`,

        [...resultIds, applicationYear]

    );

    const componentMap = new Map();

    componentRows.forEach(row => {

        const resultId = Number(row.result_id);

        if(!componentMap.has(resultId)){
            componentMap.set(resultId, {});
        }

        componentMap.get(resultId)[
            Number(row.component_id)
        ] = row.marks;

    });

    rows.forEach(row => {

        row.component_marks =
            componentMap.get(Number(row.id)) || {};

    });

    return rows;

}


// =====================================
// Section Merit List
// =====================================

static async getSectionMeritList(section, applicationYear){

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
          AND a.application_year=?

        AND r.id IS NOT NULL

        ORDER BY

            r.section_rank ASC`,

        [
              section,
              applicationYear
          ]

    );

    if(!rows.length){
        return rows;
    }

    const resultIds = rows
        .map(row => Number(row.id))
        .filter(id => Number.isInteger(id) && id > 0);

    if(!resultIds.length){
        return rows;
    }

    const placeholders = resultIds.map(() => "?").join(",");

    const [componentRows] = await db.query(

        `SELECT

            rcm.result_id,
            rcm.component_id,
            rcm.marks

        FROM rtse_result_component_marks rcm

        INNER JOIN rtse_mark_components mc

            ON mc.id=rcm.component_id

        WHERE rcm.result_id IN (${placeholders})
          AND mc.application_year=?
          AND mc.enabled=1

        ORDER BY

            mc.display_order ASC,
            mc.id ASC`,

        [...resultIds, applicationYear]

    );

    const componentMap = new Map();

    componentRows.forEach(row => {

        const resultId = Number(row.result_id);

        if(!componentMap.has(resultId)){
            componentMap.set(resultId, {});
        }

        componentMap.get(resultId)[
            Number(row.component_id)
        ] = row.marks;

    });

    rows.forEach(row => {

        row.component_marks =
            componentMap.get(Number(row.id)) || {};

    });

    return rows;

}


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

