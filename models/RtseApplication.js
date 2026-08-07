const db = require("../config/database");

class RtseApplication {

    // =====================================
    // Generate Registration Number
    // =====================================

    static async generateRegistrationNumber() {

        const year =
            new Date().getFullYear().toString().slice(-2);

        const [rows] = await db.query(

            `SELECT registration_no
             FROM rtse_applications
             ORDER BY id DESC
             LIMIT 1`

        );

        let serial = 1;

        if (rows.length) {

            serial =
                parseInt(
                    rows[0].registration_no.slice(-5)
                ) + 1;

        }

        return `ARSP${year}${String(serial).padStart(5,"0")}`;

    }

    // =====================================
    // Get Section
    // =====================================

    static getSection(studentClass){

        studentClass = Number(studentClass);

        if(studentClass===4 || studentClass===5)
            return "A";

        if(studentClass===6 || studentClass===7)
            return "B";

        if(studentClass===8)
            return "C";

        if(studentClass===9)
            return "D";

        if(studentClass===10)
            return "E";

        return "";

    }

    // =====================================
    // Create Application
    // =====================================

    static async create(data){

        const registrationNo =
            await this.generateRegistrationNumber();

        const section =
            this.getSection(data.class);

        const sql = `
        INSERT INTO rtse_applications
        (
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

            district,
            state,
            pincode,

            class,
            section,

            address,

            photo,
            identity_document
        )

        VALUES
        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const [result] =
        await db.query(sql,[

            registrationNo,

            new Date().getFullYear(),

            data.full_name,
            data.father_name,
            data.mother_name,

            data.gender,
            data.dob,

            data.mobile,
            data.email,

            data.school_name,

            data.district,
            data.state,
            data.pincode,

            data.class,
            section,

            data.address,

            data.photo,
            data.identity_document

        ]);

        return {

            id:result.insertId,

            registration_no:registrationNo,

            section

        };

    }

    // =====================================
    // Dashboard
    // =====================================

    static async getAll(){

        const [rows] =
        await db.query(

        `SELECT *
         FROM rtse_applications
         WHERE archive=0
         ORDER BY registration_no ASC`

        );

        return rows;

    }





// =====================================
// Get Application By ID
// =====================================

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

        [

            id

        ]

    );

}



// =====================================
// Dashboard Statistics
// =====================================

static async getDashboardStats(){

    const [rows] = await db.query(

        `SELECT

            COUNT(*) total,

            SUM(status='Pending') pending,

            SUM(status='Approved') approved,

            SUM(status='Rejected') rejected,

            SUM(roll_no IS NOT NULL) roll_generated,

            SUM(admit_generated=1) admit_generated

        FROM rtse_applications

        WHERE archive=0`

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

static async generateRollNumbers(section){

    const year =
        new Date().getFullYear().toString().slice(-2);

    let start = 1000;

    switch(section){

        case "A":
            start = 1000;
            break;

        case "B":
            start = 2000;
            break;

        case "C":
            start = 3000;
            break;

        case "D":
            start = 4000;
            break;

        case "E":
            start = 5000;
            break;

    }

    const [students] = await db.query(

        `SELECT *

         FROM rtse_applications

         WHERE

            archive=0

         AND

            status='Approved'

         AND

            section=?

         ORDER BY

            full_name ASC,

            registration_no ASC`,

        [

            section

        ]

    );

    let roll = start;

    for(const student of students){

        roll++;

        const rollNo =

            `RTSE${year}-${roll}`;

        await db.query(

            `UPDATE rtse_applications

             SET

                roll_no=?

             WHERE id=?`,

            [

                rollNo,

                student.id

            ]

        );

    }

    return students.length;

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
// Generate Admit Cards
// =====================================

static async generateAdmitCards(section){

    await db.query(

        `UPDATE rtse_applications

         SET

            admit_generated=1

         WHERE

            archive=0

         AND

            status='Approved'

         AND

            section=?

         AND

            roll_no IS NOT NULL`,

        [

            section

        ]

    );

}



// =====================================
// Get Admit Card Students
// =====================================

static async getAdmitCardStudents(section){

    const [rows] = await db.query(

        `SELECT *

         FROM rtse_applications

       WHERE
    archive=0
AND
    status='Approved'
AND
    roll_no IS NOT NULL
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
// Section Statistics
// =====================================

static async getSectionStatistics(){

    const [rows]=await db.query(

        `SELECT

            section,

            COUNT(*) total,

            SUM(status='Approved') approved,

            SUM(status='Pending') pending,

            SUM(status='Rejected') rejected,

            SUM(roll_no IS NOT NULL) roll_generated,

            SUM(admit_generated=1) admit_generated

        FROM rtse_applications

        WHERE archive=0

        GROUP BY section

        ORDER BY section`

    );

    return rows;

}




// =====================================
// Update Application
// =====================================

static async update(id,data){

    await db.query(

        `UPDATE rtse_applications

         SET

            full_name=?,
            father_name=?,
            mother_name=?,
            mobile=?,
            email=?,
            school_name=?,
            district=?,
            state=?,
            class=?,
            status=?

         WHERE id=?`,

        [

            data.full_name,
            data.father_name,
            data.mother_name,
            data.mobile,
            data.email,
            data.school_name,
            data.district,
            data.state,
            data.class,
            data.status,

            id

        ]

    );

}




}


module.exports = RtseApplication;
