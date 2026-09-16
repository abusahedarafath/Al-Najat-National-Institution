const db = require("../config/database");

class RtseMarkComponent {
    // =====================================
    // Get all components for an exam year
    // =====================================
    static async getByYear(applicationYear) {
        const [rows] = await db.query(
            `SELECT
                id,
                application_year,
                name,
                maximum_marks,
                enabled,
                display_order,
                created_at,
                updated_at
             FROM rtse_mark_components
             WHERE application_year=?
             ORDER BY display_order ASC, id ASC`,
            [applicationYear]
        );

        return rows;
    }

    // =====================================
    // Get enabled components for an exam year
    // =====================================
    static async getEnabledByYear(applicationYear) {
        const [rows] = await db.query(
            `SELECT
                id,
                application_year,
                name,
                maximum_marks,
                enabled,
                display_order
             FROM rtse_mark_components
             WHERE application_year=?
               AND enabled=1
             ORDER BY display_order ASC, id ASC`,
            [applicationYear]
        );

        return rows;
    }

    // =====================================
    // Get component by ID
    // =====================================
    static async getById(id) {
        const [rows] = await db.query(
            `SELECT
                id,
                application_year,
                name,
                maximum_marks,
                enabled,
                display_order,
                created_at,
                updated_at
             FROM rtse_mark_components
             WHERE id=?
             LIMIT 1`,
            [id]
        );

        return rows[0] || null;
    }

    // =====================================
    // Create component
    // =====================================
    static async create(data) {
        const [result] = await db.query(
            `INSERT INTO rtse_mark_components (
                application_year,
                name,
                maximum_marks,
                enabled,
                display_order
             )
             VALUES (?,?,?,?,?)`,
            [
                data.application_year,
                data.name,
                data.maximum_marks,
                data.enabled === undefined ? 1 : data.enabled,
                data.display_order === undefined ? 0 : data.display_order
            ]
        );

        return result.insertId;
    }

    // =====================================
    // Update component
    // =====================================
    static async update(id, data) {
        await db.query(
            `UPDATE rtse_mark_components
             SET
                name=?,
                maximum_marks=?,
                enabled=?,
                display_order=?
             WHERE id=?`,
            [
                data.name,
                data.maximum_marks,
                data.enabled === undefined ? 1 : data.enabled,
                data.display_order === undefined ? 0 : data.display_order,
                id
            ]
        );
    }

    // =====================================
    // Get saved component marks for result
    // =====================================
    static async getResultMarks(resultId) {
        const [rows] = await db.query(
            `SELECT
                rcm.id,
                rcm.result_id,
                rcm.component_id,
                rcm.marks,
                mc.name,
                mc.maximum_marks,
                mc.enabled,
                mc.display_order
             FROM rtse_result_component_marks rcm
             INNER JOIN rtse_mark_components mc
                ON mc.id=rcm.component_id
             WHERE rcm.result_id=?
             ORDER BY mc.display_order ASC, mc.id ASC`,
            [resultId]
        );

        return rows;
    }

    // =====================================
    // Save component marks using connection
    // =====================================
    static async getResultMarksByResultIds(resultIds) {
        const ids = [
            ...new Set(
                (Array.isArray(resultIds) ? resultIds : [])
                    .map(id => Number(id))
                    .filter(id => Number.isInteger(id) && id > 0)
            )
        ];

        if (!ids.length) {
            return {};
        }

        const placeholders = ids.map(() => "?").join(",");

        const [rows] = await db.query(
            `SELECT
                rcm.result_id,
                rcm.component_id,
                rcm.marks
             FROM rtse_result_component_marks rcm
             INNER JOIN rtse_mark_components mc
                ON mc.id=rcm.component_id
             WHERE rcm.result_id IN (${placeholders})
             ORDER BY
                rcm.result_id ASC,
                mc.display_order ASC,
                mc.id ASC`,
            ids
        );

        const resultMap = {};

        rows.forEach(row => {
            const resultId = Number(row.result_id);
            const componentId = Number(row.component_id);

            if (!resultMap[resultId]) {
                resultMap[resultId] = {};
            }

            resultMap[resultId][componentId] = row.marks;
        });

        return resultMap;
    }

    static async saveResultMarks(connection, resultId, componentMarks) {
        await connection.query(
            `DELETE FROM rtse_result_component_marks
             WHERE result_id=?`,
            [resultId]
        );

        for (const item of componentMarks) {
            await connection.query(
                `INSERT INTO rtse_result_component_marks (
                    result_id,
                    component_id,
                    marks
                 )
                 VALUES (?,?,?)`,
                [
                    resultId,
                    item.component_id,
                    item.marks
                ]
            );
        }
    }

    // =====================================
    // Delete component
    // =====================================
    // The database foreign key intentionally
    // prevents deleting a component already used
    // by student results.
    // =====================================
    static async delete(id) {
        await db.query(
            `DELETE FROM rtse_mark_components
             WHERE id=?`,
            [id]
        );
    }
}

module.exports = RtseMarkComponent;
