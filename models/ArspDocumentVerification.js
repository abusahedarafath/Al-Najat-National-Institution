const db = require("../config/database");

class ArspDocumentVerification {

    // Create verification record
    static async create(data) {

        const [result] = await db.query(
            `INSERT INTO arsp_document_verifications
            (
                member_id,
                document_type,
                document_number,
                issue_date,
                status
            )
            VALUES (?,?,?,?,?)`,
            [
                data.member_id,
                data.document_type,
                data.document_number,
                data.issue_date,
                data.status || "Valid"
            ]
        );

        return result;
    }

    // Find by document number
    static async getByDocumentNumber(documentNumber) {

        const [rows] = await db.query(
            `SELECT *
             FROM arsp_document_verifications
             WHERE document_number=?`,
            [documentNumber]
        );

        return rows[0] || null;
    }

    // Get all documents of a member
    static async getByMember(memberId) {

        const [rows] = await db.query(
            `SELECT *
             FROM arsp_document_verifications
             WHERE member_id=?
             ORDER BY id DESC`,
            [memberId]
        );

        return rows;
    }

    // Revoke document
    static async revoke(id) {

        return await db.query(
            `UPDATE arsp_document_verifications
             SET status='Revoked'
             WHERE id=?`,
            [id]
        );
    }



// Get all document verifications
static async getAll() {

    const [rows] = await db.query(`
        SELECT
            v.*,
            m.full_name,
            m.member_id
        FROM arsp_document_verifications v
        LEFT JOIN arsp_members m
            ON v.member_id = m.id
        ORDER BY v.id DESC
    `);

    return rows;

}





}



module.exports = ArspDocumentVerification;
