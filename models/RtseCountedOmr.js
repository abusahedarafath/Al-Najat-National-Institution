const db = require("../config/database");

class RtseCountedOmr {

    // =====================================
    // Get Counted OMR by Application
    // =====================================
    static async getByApplication(applicationId) {
        const id = Number(applicationId);

        if (!Number.isInteger(id) || id < 1) {
            return null;
        }

        const [rows] = await db.query(
            `
            SELECT
                id,
                application_id,
                file_name,
                original_name,
                mime_type,
                file_size,
                created_at,
                updated_at
            FROM rtse_counted_omr
            WHERE application_id = ?
            LIMIT 1
            `,
            [id]
        );

        return rows[0] || null;
    }

    // =====================================
    // Get Counted OMR Records by Applications
    // =====================================
    static async getByApplications(applicationIds = []) {
        const ids = [
            ...new Set(
                applicationIds
                    .map(Number)
                    .filter(id => Number.isInteger(id) && id > 0)
            )
        ];

        if (!ids.length) {
            return [];
        }

        const placeholders = ids.map(() => "?").join(",");

        const [rows] = await db.query(
            `
            SELECT
                id,
                application_id,
                file_name,
                original_name,
                mime_type,
                file_size,
                created_at,
                updated_at
            FROM rtse_counted_omr
            WHERE application_id IN (${placeholders})
            ORDER BY application_id ASC
            `,
            ids
        );

        return rows;
    }

    // =====================================
    // Create Counted OMR Record
    // =====================================
    static async create(data) {
        const applicationId = Number(data.application_id);

        if (!Number.isInteger(applicationId) || applicationId < 1) {
            throw new Error("Invalid RTSE application ID.");
        }

        if (!data.file_name) {
            throw new Error("Counted OMR file name is required.");
        }

        const [result] = await db.query(
            `
            INSERT INTO rtse_counted_omr (
                application_id,
                file_name,
                original_name,
                mime_type,
                file_size
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                applicationId,
                String(data.file_name),
                data.original_name
                    ? String(data.original_name).slice(0, 255)
                    : null,
                data.mime_type
                    ? String(data.mime_type).slice(0, 100)
                    : "image/jpeg",
                Math.max(0, Number(data.file_size) || 0)
            ]
        );

        return {
            id: result.insertId,
            application_id: applicationId,
            file_name: String(data.file_name),
            original_name: data.original_name || null,
            mime_type: data.mime_type || "image/jpeg",
            file_size: Math.max(0, Number(data.file_size) || 0)
        };
    }

    // =====================================
    // Update Counted OMR Record
    // =====================================
    static async update(id, data) {
        const recordId = Number(id);

        if (!Number.isInteger(recordId) || recordId < 1) {
            throw new Error("Invalid Counted OMR ID.");
        }

        const [result] = await db.query(
            `
            UPDATE rtse_counted_omr
            SET
                file_name = ?,
                original_name = ?,
                mime_type = ?,
                file_size = ?
            WHERE id = ?
            `,
            [
                String(data.file_name),
                data.original_name
                    ? String(data.original_name).slice(0, 255)
                    : null,
                data.mime_type
                    ? String(data.mime_type).slice(0, 100)
                    : "image/jpeg",
                Math.max(0, Number(data.file_size) || 0),
                recordId
            ]
        );

        return result.affectedRows > 0;
    }

    // =====================================
    // Create or Update Latest Counted OMR
    // =====================================
    static async upsert(data) {
        const existing = await this.getByApplication(
            data.application_id
        );

        if (existing) {
            await this.update(existing.id, data);

            return {
                ...existing,
                file_name: String(data.file_name),
                original_name: data.original_name || null,
                mime_type: data.mime_type || "image/jpeg",
                file_size: Math.max(0, Number(data.file_size) || 0)
            };
        }

        return this.create(data);
    }
}

module.exports = RtseCountedOmr;
