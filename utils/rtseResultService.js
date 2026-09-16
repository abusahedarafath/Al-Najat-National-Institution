const db = require("../config/database");
const RtseResult = require("../models/RtseResult");
const RtseMarkComponent = require("../models/RtseMarkComponent");

/**
 * Shared RTSE result calculation + persistence.
 *
 * Existing r.marks remains the OMR obtained mark.
 *
 * Configured components are stored separately and combined with
 * the OMR mark to produce:
 *
 *   total_marks
 *   total_full_marks
 *   percentage
 *   grade
 *
 * Both Admin Result Entry and Super Scanner use this service.
 */

function calculateGrade(percentage) {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    return "F";
}

function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : NaN;
}

function readComponentMarks(source) {
    const raw =
        source && typeof source.component_marks === "object"
            ? source.component_marks
            : {};

    return raw;
}

async function saveRtseResult(applicationId, body) {
    const normalizedApplicationId =
        String(applicationId || "").trim();

    if (!normalizedApplicationId) {
        throw new Error("Invalid student application.");
    }

    const source =
        body && typeof body === "object"
            ? body
            : {};

    /*
     * Determine the application year from the student record.
     * This prevents the client from choosing a different year's
     * component configuration.
     */
    const student =
        await RtseResult.getByApplication(
            normalizedApplicationId
        );

    if (!student) {
        throw new Error("Student result record not found.");
    }

    const applicationYear =
        Number(student.application_year);

    if (
        !Number.isInteger(applicationYear) ||
        applicationYear <= 0
    ) {
        throw new Error("Invalid RTSE application year.");
    }

    /*
     * Components are controlled by the server configuration.
     * The browser cannot change their maximum marks.
     */
    const components =
        await RtseMarkComponent.getEnabledByYear(
            applicationYear
        );

    const omrMarks = toNumber(source.marks);

    if (
        !Number.isFinite(omrMarks) ||
        omrMarks < 0 ||
        omrMarks > 100
    ) {
        throw new Error(
            "Invalid OMR obtained marks. OMR marks must be between 0 and 100."
        );
    }

    const submittedComponents =
        readComponentMarks(source);

    const componentMarks = [];
    let configuredObtainedMarks = 0;
    let configuredFullMarks = 0;

    for (const component of components) {
        const componentId =
            String(component.id);

        const rawValue =
            submittedComponents[componentId];

        /*
         * Empty component input means zero.
         * This makes newly configured components safe to
         * introduce without breaking existing result entry.
         */
        const value =
            rawValue === undefined ||
            rawValue === null ||
            String(rawValue).trim() === ""
                ? 0
                : toNumber(rawValue);

        const maximumMarks =
            toNumber(component.maximum_marks);

        if (
            !Number.isFinite(maximumMarks) ||
            maximumMarks <= 0
        ) {
            throw new Error(
                `Invalid maximum marks configured for "${component.name}".`
            );
        }

        if (
            !Number.isFinite(value) ||
            value < 0 ||
            value > maximumMarks
        ) {
            throw new Error(
                `Invalid marks for "${component.name}". Enter a value between 0 and ${maximumMarks}.`
            );
        }

        componentMarks.push({
            component_id: Number(component.id),
            marks: Number(value.toFixed(2))
        });

        configuredObtainedMarks += value;
        configuredFullMarks += maximumMarks;
    }

    /*
     * OMR is always 100 marks.
     * Configured components are added to that maximum.
     */
    const totalMarks =
        omrMarks + configuredObtainedMarks;

    const totalFullMarks =
        100 + configuredFullMarks;

    const percentage =
        Number(
            ((totalMarks / totalFullMarks) * 100)
                .toFixed(2)
        );

    const grade =
        calculateGrade(percentage);

    const rankValue =
        source.rank_no === undefined ||
        source.rank_no === null ||
        String(source.rank_no).trim() === ""
            ? null
            : toNumber(source.rank_no);

    const rankNo =
        Number.isFinite(rankValue)
            ? rankValue
            : null;

    const resultStatus =
        percentage >= 40
            ? "Pass"
            : "Fail";

    const resultData = {
        application_id: normalizedApplicationId,

        // Existing field: deliberately remains OMR.
        marks: Number(omrMarks.toFixed(2)),

        // New calculated totals.
        total_marks: Number(totalMarks.toFixed(2)),
        total_full_marks: Number(totalFullMarks.toFixed(2)),

        // Calculated from total marks.
        percentage,
        grade,

        rank_no: rankNo,
        result_status: resultStatus
    };

    const connection =
        await db.getConnection();

    try {
        await connection.beginTransaction();

        const old =
            await RtseResult.getByApplicationWithConnection(
                connection,
                normalizedApplicationId
            );

        let resultId;

        if (old) {
            resultId = old.id;

            await connection.query(
                `UPDATE rtse_results
                 SET
                    marks=?,
                    total_marks=?,
                    total_full_marks=?,
                    percentage=?,
                    grade=?,
                    rank_no=?,
                    result_status=?
                 WHERE application_id=?`,
                [
                    resultData.marks,
                    resultData.total_marks,
                    resultData.total_full_marks,
                    resultData.percentage,
                    resultData.grade,
                    resultData.rank_no,
                    resultData.result_status,
                    normalizedApplicationId
                ]
            );
        } else {
            const [result] =
                await connection.query(
                    `INSERT INTO rtse_results (
                        application_id,
                        marks,
                        total_marks,
                        total_full_marks,
                        percentage,
                        grade,
                        rank_no,
                        result_status
                     )
                     VALUES (?,?,?,?,?,?,?,?)`,
                    [
                        resultData.application_id,
                        resultData.marks,
                        resultData.total_marks,
                        resultData.total_full_marks,
                        resultData.percentage,
                        resultData.grade,
                        resultData.rank_no,
                        resultData.result_status
                    ]
                );

            resultId = result.insertId;
        }

        /*
         * Replace this student's component values atomically.
         *
         * If no components are configured, the DELETE simply
         * removes any old component values and leaves none.
         */
        await RtseMarkComponent.saveResultMarks(
            connection,
            resultId,
            componentMarks
        );

        await connection.commit();

        return {
            ...resultData,
            result_id: resultId,
            components: componentMarks,
            configured_obtained_marks:
                Number(configuredObtainedMarks.toFixed(2)),
            configured_full_marks:
                Number(configuredFullMarks.toFixed(2))
        };
    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error(
                "RTSE result rollback error:",
                rollbackError
            );
        }

        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    saveRtseResult,
    calculateGrade
};
