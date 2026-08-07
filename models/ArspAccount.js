const db = require("../config/database");
const bcrypt = require("bcryptjs");

class ArspAccount {

    // ==========================
    // Generate Member ID
    // ==========================

    static async generateMemberId() {

        const [rows] = await db.query(`
            SELECT id
            FROM arsp_members
            ORDER BY id DESC
            LIMIT 1
        `);

        const nextNumber = rows.length
            ? rows[0].id + 1
            : 1;

        return "ARSP" + String(nextNumber).padStart(6, "0");

    }


    // ==========================
    // Create Login Account
    // ==========================

static async create(memberDbId, memberId, mobile) {

    const hash = await bcrypt.hash(mobile, 10);
        const sql = `
            INSERT INTO arsp_accounts

      (
    member_id,
    arsp_id,
    password,
    force_password_change
)
VALUES (?,?,?,?) 


        `;

        const [result] =
           await db.query(sql, [

    memberDbId,
    memberId,
    hash,
    1

]);

        return result;

    }

    // ==========================
    // Login
    // ==========================

    static async login(arspId,password){

        const [rows] = await db.query(

            `SELECT *
             FROM arsp_accounts
             WHERE arsp_id=?`,

            [arspId]

        );

        if(rows.length===0){

            return null;

        }

        const account = rows[0];

        const match =
            await bcrypt.compare(
                password,
                account.password
            );

        if(!match){

            return null;

        }

        return account;

    }

   // ==========================
// Verify Current Password
// ==========================

static async verifyPassword(accountId, password) {

    const [rows] = await db.query(

        `SELECT *
         FROM arsp_accounts
         WHERE id=?`,

        [accountId]

    );

    if (rows.length === 0) {

        return false;

    }

    return await bcrypt.compare(

        password,

        rows[0].password

    );

}


// ==========================
// Update Password
// ==========================

static async updatePassword(accountId, newPassword) {

const hash = await bcrypt.hash(newPassword,10);
    await db.query(

        `UPDATE arsp_accounts
         SET password=?
         WHERE id=?`,

        [

            hash,

            accountId

        ]

    );

}



// ==========================
// Admin Reset Password
// ==========================

static async updatePasswordByMemberId(memberId, newPassword) {

    const hash = await bcrypt.hash(newPassword, 10);

    await db.query(

        `UPDATE arsp_accounts
         SET password=?
         WHERE member_id=?`,

        [

            hash,

            memberId

        ]

    );

}



// ==========================
// Force Password Change
// ==========================

static async requirePasswordChange(memberId) {

    await db.query(

        `UPDATE arsp_accounts
         SET force_password_change=1
         WHERE member_id=?`,

        [

            memberId

        ]

    );

}




// ==========================
// Clear Password Change Flag
// ==========================

static async clearPasswordChange(memberId) {

    await db.query(

        `UPDATE arsp_accounts
         SET force_password_change=0
         WHERE member_id=?`,

        [

            memberId

        ]

    );

}

// ==========================
// Account Login Details
// ==========================

static async loginDetails(memberId) {

    const [rows] = await db.query(

        `SELECT
            arsp_id,
            account_status,
            last_login,
            force_password_change
         FROM arsp_accounts
         WHERE member_id=?`,

        [memberId]

    );

    return rows[0] || null;

}


}

module.exports = ArspAccount;
