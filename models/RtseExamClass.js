
const db = require("../config/database");
const RtseExamSection = require("./RtseExamSection");

class RtseExamClass {
    // =====================================
    // Get a named class by ID and exam
    // =====================================
    static async getById(examSettingId, classDefinitionId) {
        const examId = Number(examSettingId);
        const classId = Number(classDefinitionId);

        if (
            !Number.isInteger(examId) ||
            examId <= 0 ||
            !Number.isInteger(classId) ||
            classId <= 0
        ) {
            return null;
        }

        const [rows] = await db.query(
            `SELECT
                c.id,
                c.exam_setting_id,
                c.class_name,
                c.exam_section_id,
                c.sort_order,
                s.section_name
             FROM rtse_exam_classes AS c
             INNER JOIN rtse_exam_sections AS s
                ON s.id = c.exam_section_id
               AND s.exam_setting_id = c.exam_setting_id
             WHERE c.exam_setting_id = ?
               AND c.id = ?
             LIMIT 1`,
            [examId, classId]
        );

        return rows[0] || null;
    }

    // =====================================
    // Get all named classes for an exam
    // =====================================
    static async getAll(examSettingId) {
        const examId = Number(examSettingId);

        if (!Number.isInteger(examId) || examId <= 0) {
            throw new Error("Invalid examination setting ID.");
        }

        const [rows] = await db.query(
            `SELECT
                c.id,
                c.exam_setting_id,
                c.class_name,
                c.exam_section_id,
                c.sort_order,
                s.section_name
             FROM rtse_exam_classes AS c
             INNER JOIN rtse_exam_sections AS s
                ON s.id = c.exam_section_id
               AND s.exam_setting_id = c.exam_setting_id
             WHERE c.exam_setting_id = ?
             ORDER BY c.sort_order ASC, c.id ASC`,
            [examId]
        );

        return rows;
    }

    // =====================================
    // Validate a named class selection
    // =====================================
    static async validateSelection(examSettingId, classDefinitionId) {
        const selected = await this.getById(
            examSettingId,
            classDefinitionId
        );

        if (!selected) {
            return null;
        }

        const normalizedName =
            RtseExamSection.normalizeClassName(selected.class_name);

        const normalizedSection =
            RtseExamSection.normalizeSectionName(selected.section_name);

        if (!normalizedName || !normalizedSection) {
            return null;
        }

        return {
            id: Number(selected.id),
            exam_setting_id: Number(selected.exam_setting_id),
            class_name: normalizedName,
            exam_section_id: Number(selected.exam_section_id),
            section_name: normalizedSection,
            sort_order: Number(selected.sort_order)
        };
    }

    // =====================================
    // Check whether named-class registration
    // has the required database schema
    // =====================================
    static async isRegistrationReady() {
        const [rows] = await db.query(
            `SELECT
                EXISTS(
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                      AND table_name = 'rtse_exam_classes'
                ) AS has_class_table,
                EXISTS(
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = DATABASE()
                      AND table_name = 'rtse_applications'
                      AND column_name = 'class_definition_id'
                ) AS has_class_column`
        );

        const state = rows[0] || {};

        return (
            Number(state.has_class_table) === 1 &&
            Number(state.has_class_column) === 1
        );
    }
}

module.exports = RtseExamClass;

