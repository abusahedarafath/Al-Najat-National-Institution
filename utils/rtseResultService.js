const RtseResult = require("../models/RtseResult");

/**
 * Shared RTSE result calculation + persistence.
 *
 * This preserves the existing Admin Result behavior while allowing
 * the Super Scanner to use exactly the same result-saving logic.
 */
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

    const fullMarks = Number(source.full_marks);
    const marks = Number(source.marks);

    if (!Number.isFinite(fullMarks) || fullMarks <= 0) {
        throw new Error("Invalid full marks.");
    }

    if (
        !Number.isFinite(marks) ||
        marks < 0 ||
        marks > fullMarks
    ) {
        throw new Error("Invalid obtained marks.");
    }

    const percentage =
        Number(((marks / fullMarks) * 100).toFixed(2));

    let grade;

    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C+";
    else if (percentage >= 40) grade = "C";
    else grade = "F";

    const rankValue =
        source.rank_no === undefined ||
        source.rank_no === null ||
        String(source.rank_no).trim() === ""
            ? null
            : Number(source.rank_no);

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
        marks,
        percentage,
        grade,
        rank_no: rankNo,
        result_status: resultStatus
    };

    const old =
        await RtseResult.getByApplication(
            normalizedApplicationId
        );

    if (old) {
        await RtseResult.update(
            normalizedApplicationId,
            resultData
        );
    } else {
        await RtseResult.save(resultData);
    }

    return resultData;
}

module.exports = {
    saveRtseResult
};
