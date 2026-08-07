const db = require("../config/database");

class ArspCommittee {

    static async getAll() {

        const [rows] = await db.query(

            `SELECT *
             FROM arsp_committees
             ORDER BY id DESC`

        );

        return rows;

    }

    static async getById(id) {

        const [rows] = await db.query(

            "SELECT * FROM arsp_committees WHERE id=?",

            [id]

        );

        return rows[0];

    }

    static async create(data) {

        await db.query(

            `INSERT INTO arsp_committees
            (
                committee_name,
                session_name,
                start_date,
                end_date,
                status
            )

            VALUES (?,?,?,?,?)`,

            [

                data.committee_name,

                data.session_name,

                data.start_date,

                data.end_date,

                data.status

            ]

        );

    }

    static async update(id,data){

        await db.query(

            `UPDATE arsp_committees

            SET

            committee_name=?,

            session_name=?,

            start_date=?,

            end_date=?,

            status=?

            WHERE id=?`,

            [

                data.committee_name,

                data.session_name,

                data.start_date,

                data.end_date,

                data.status,

                id

            ]

        );

    }

    static async delete(id){

        await db.query(

            "DELETE FROM arsp_committees WHERE id=?",

            [id]

        );





    }




// ==========================
// Count Committees
// ==========================

static async count() {

    const [[row]] = await db.query(
        `SELECT COUNT(*) AS total
         FROM arsp_committees`
    );

    return row.total;

}




}

module.exports = ArspCommittee;
