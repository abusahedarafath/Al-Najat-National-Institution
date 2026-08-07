const db = require("../config/database");

class ArspMember {



   // ==========================
// Get Member By ID
// ==========================
// ==========================
// Get Member By ID
// ==========================

static async getById(id) {

    const [rows] = await db.query(

        `SELECT
            m.*,
            p.section,
            p.designation,
            c.committee_name AS committee

        FROM arsp_members m

        LEFT JOIN arsp_management_positions p
            ON m.id = p.member_id
            AND p.status = 'Active'

        LEFT JOIN arsp_committees c
            ON p.committee_id = c.id

        WHERE m.id = ?

        LIMIT 1`,

        [id]

    );

    return rows[0] || null;

}







// ==========================
// Check Duplicate Registration
// ==========================
static async findDuplicate(mobile, email, identityNumber) {

    let sql = `
        SELECT *
        FROM arsp_members
        WHERE mobile = ?
    `;

    const params = [mobile];

    if (email && email.trim() !== "") {
        sql += " OR email = ?";
        params.push(email.trim());
    }

    if (identityNumber && identityNumber.trim() !== "") {
        sql += " OR identity_number = ?";
        params.push(identityNumber.trim());
    }

    sql += " LIMIT 1";

    const [rows] = await db.query(sql, params);

    return rows.length ? rows[0] : null;
}



    // ==========================
// Get Member By ARSP ID
// ==========================

static async getByMemberId(memberId) {

    const [rows] = await db.query(

        `SELECT
            m.*,
            p.section,
            p.designation,
            c.committee_name AS committee

        FROM arsp_members m

        LEFT JOIN arsp_management_positions p
            ON m.id = p.member_id
            AND p.status = 'Active'

        LEFT JOIN arsp_committees c
            ON p.committee_id = c.id

        WHERE m.member_id = ?

        LIMIT 1`,

        [memberId]

    );

    return rows[0] || null;

}





// ==========================
// Register Member
// ==========================

static async create(data) {

const sql = `
INSERT INTO arsp_members
(
    member_id,
    registration_no,
    full_name,
    father_name,
    mother_name,
    gender,
    dob,
    blood_group,
    occupation,
    nationality,
    identity_type,
    identity_number,
    identity_front,
    identity_back,
    mobile,
    email,
    address,
    district,
    state,
    pincode,
    emergency_contact_name,
    emergency_contact_relation,
    emergency_contact_mobile,
    photo,
    joining_date,
    status,
    registration_source,
    approval_status
)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`;

const [result] = await db.query(sql, [

    data.member_id,
    data.registration_no,

    data.full_name,
    data.father_name,
    data.mother_name,
    data.gender,
    data.dob,
    data.blood_group,

    data.occupation,
    data.nationality,

    data.identity_type,
    data.identity_number,
    data.identity_front,
    data.identity_back,

    data.mobile,
    data.email,

    data.address,
    data.district,
    data.state,
    data.pincode,

    data.emergency_contact_name,
    data.emergency_contact_relation,
    data.emergency_contact_mobile,

    data.photo,

    data.joining_date,

    data.status,

    data.registration_source,

    data.approval_status

]);

    return result;

}


    // ==========================
    // Update Member
    // ==========================

    static async update(id, data) {

        const sql = `
            UPDATE arsp_members
            SET
                full_name=?,
                father_name=?,
                mother_name=?,
                gender=?,
                dob=?,
                blood_group=?,
                mobile=?,
                email=?,
                address=?,
                district=?,
                state=?,
                pincode=?,
                photo=?,
                joining_date=?,
                status=?
            WHERE id=?
        `;

        const [result] = await db.query(sql, [

            data.full_name,
            data.father_name,
            data.mother_name,
            data.gender,
            data.dob,
            data.blood_group,
            data.mobile,
            data.email,
            data.address,
            data.district,
            data.state,
            data.pincode,
            data.photo,
            data.joining_date,
            data.status,
            id

        ]);

        return result;

    }
 

    // ==========================
    // Get All Members
    // ==========================

static async getAll(search = "") {

    let sql = `

        SELECT
            m.*,
            p.section,
            p.designation,
            c.committee_name AS committee

        FROM arsp_members m

        LEFT JOIN arsp_management_positions p
            ON m.id = p.member_id
            AND p.status='Active'

        LEFT JOIN arsp_committees c
            ON p.committee_id=c.id

    `;

    const params = [];

    if (search) {

        sql += `

            WHERE

                m.full_name LIKE ?

                OR m.member_id LIKE ?

                OR m.mobile LIKE ?

                OR p.designation LIKE ?

                OR c.committee_name LIKE ?

        `;

        const keyword = `%${search}%`;

        params.push(
            keyword,
            keyword,
            keyword,
            keyword,
            keyword
        );

    }

    sql += ` ORDER BY m.id DESC`;

    const [rows] = await db.query(sql, params);

    return rows;

}



// ==========================
// Update QR Code
// ==========================

static async updateQRCode(id, qrCode) {

    await db.query(

        `UPDATE arsp_members
         SET qr_code=?
         WHERE id=?`,

        [

            qrCode,
            id

        ]

    );

}




// ==========================
// Toggle Member Status
// ==========================

static async toggleStatus(id){

    const member = await this.getById(id);

    if(!member) return false;

    const newStatus =
        member.status==="Active"
        ? "Inactive"
        : "Active";

    await db.query(

        `UPDATE arsp_members
         SET status=?
         WHERE id=?`,

        [

            newStatus,

            id

        ]

    );

    return newStatus;

}

// ==========================
// Delete Member
// ==========================

static async remove(id){

    await db.query(

        "DELETE FROM arsp_accounts WHERE member_id=?",

        [id]

    );

    await db.query(

        "DELETE FROM arsp_management_positions WHERE member_id=?",

        [id]

    );

    await db.query(

        "DELETE FROM arsp_members WHERE id=?",

        [id]

    );

}





}

module.exports = ArspMember;
