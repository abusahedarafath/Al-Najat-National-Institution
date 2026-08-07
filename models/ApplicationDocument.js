const db = require("../config/database");

class ApplicationDocument {

    static async create(applicationId, documentType, fileName) {
        const sql = `
            INSERT INTO application_documents
            (application_id, document_type, file_name)
            VALUES (?,?,?)
        `;

        const [result] = await db.query(sql, [
            applicationId,
            documentType,
            fileName
        ]);

        return result;
    }

    static async getByApplicationId(applicationId) {
        const [rows] = await db.query(
            "SELECT * FROM application_documents WHERE application_id = ?",
            [applicationId]
        );

        return rows;
    }


// Delete all documents of an application
static async deleteByApplicationId(applicationId) {
    const [result] = await db.query(
        "DELETE FROM application_documents WHERE application_id = ?",
        [applicationId]
    );

    return result;
}
}

module.exports = ApplicationDocument;
