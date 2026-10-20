const RtseSetting = require("../models/RtseSetting");
const RtseApplication = require("../models/RtseApplication");
const RtseCentre = require("../models/RtseCentre");
const RtseExamSetting = require("../models/RtseExamSetting");
const RtseExamSection = require("../models/RtseExamSection");
const RtseResultQr = require("../models/RtseResultQr");
const QRCode = require("qrcode");
const { createOmrPdf } = require("../utils/rtseOmrPdf");

function normalizeSection(value) {
    return String(value || "").trim().toUpperCase();
}

async function isConfiguredSection(section, examSettingId) {
    const examId = Number(examSettingId);

    if (
        !normalizeSection(section) ||
        !Number.isInteger(examId) ||
        examId <= 0
    ) {
        return false;
    }

    const sections = await RtseExamSection.getSections(examId);
    return sections.some(item =>
        normalizeSection(item.section_name) === normalizeSection(section)
    );
}

async function prepareStudent(student, examSetting, centreCache) {
    let centreName = "";

    if (student.school_id) {
        const cacheKey = `${student.school_id}:${student.application_year || examSetting?.exam_year || ""}`;

        if (centreCache.has(cacheKey)) {
            centreName = centreCache.get(cacheKey);
        } else {
            try {
                const centre = await RtseCentre.getSchoolAssignment(
                    student.school_id,
                    student.application_year || examSetting?.exam_year
                );

                centreName =
                    centre?.centre_name ||
                    centre?.name ||
                    centre?.examination_centre ||
                    centre?.centre ||
                    "";
            } catch (error) {
                console.error(
                    "RTSE OMR centre lookup error:",
                    error
                );
            }

            centreCache.set(cacheKey, centreName);
        }
    }

    let resultQrBuffer = null;

    try {
        const resultQr =
            await RtseResultQr.getByApplication(student.id);

        if (resultQr?.qr_token) {
            resultQrBuffer = await QRCode.toBuffer(
                resultQr.qr_token,
                {
                    width: 220,
                    margin: 2,
                    errorCorrectionLevel: "M",
                    type: "png"
                }
            );
        }
    } catch (error) {
        console.error(
            `Unable to create Result QR for RTSE application ${student.id}:`,
            error
        );
    }

    return {
        id: student.id,
        full_name: student.full_name,
        father_name: student.father_name,
        registration_no: student.registration_no,
        roll_no: student.roll_no,
        roll_number: student.roll_number,
        school_name: student.school_name,
        school_id: student.school_id,
        class: student.class,
        section: normalizeSection(student.section),
        application_year: student.application_year,
        exam_year: examSetting?.exam_year || student.application_year,
        exam_name: examSetting?.exam_name || "RTSE EXAMINATION",
        exam_date: examSetting?.exam_date || "",
        centre_name: centreName || "Not Assigned",
        photo: student.photo,
        resultQrBuffer
    };
}
async function beginPdfResponse(res, filename, students) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
    );
    res.setHeader("Cache-Control", "no-store");

    const doc = await createOmrPdf(students);
    doc.pipe(res);
    doc.end();
}


exports.generateSectionOmr = async (req, res) => {
    const section = normalizeSection(req.params.section);
    const examSettingId = Number(req.params.id);

    try {
        if (!Number.isInteger(examSettingId) || examSettingId <= 0) {
            throw new Error("A valid examination must be selected.");
        }

        const examSetting = await RtseExamSetting.getById(examSettingId);
        if (!examSetting) {
            throw new Error("The selected examination was not found.");
        }

        if (!(await isConfiguredSection(section, examSettingId))) {
            throw new Error("This section is not configured for the selected examination.");
        }

        const examYear = Number(examSetting.exam_year);
        if (!Number.isInteger(examYear) || examYear <= 0) {
            throw new Error("The selected examination has an invalid exam year.");
        }

        // Admit cards must already be generated for this examination and section.
        const students =
            await RtseApplication.getExamGeneratedAdmitCardStudents(
                section,
                examYear,
                examSettingId
            );

        if (!students.length) {
            req.flash(
                "error",
                `No generated admit-card students found for Section ${section} (${examYear}).`
            );
            return res.redirect("/admin/rtse");
        }

        // Explicit OMR generation refreshes Result QR tokens.
        // It does not activate Result QR or change attendance.
        for (const student of students) {
            await RtseResultQr.regenerateForApplication(student.id);
        }

        await RtseApplication.markOmrGeneratedForSection(
            section,
            examYear,
            examSettingId
        );

        const centreCache = new Map();
        const preparedStudents = [];

        for (const student of students) {
            preparedStudents.push(
                await prepareStudent(
                    { ...student, section },
                    examSetting,
                    centreCache
                )
            );
        }

        return await beginPdfResponse(
            res,
            `RTSE-OMR-Section-${section}-${examYear}.pdf`,
            preparedStudents
        );
    } catch (error) {
        console.error("RTSE Generate Section OMR Error:", error);
        if (!res.headersSent) {
            req.flash("error", error.message || "Unable to generate Section OMR sheets.");
            return res.redirect("/admin/rtse");
        }
        return res.end();
    }
};

exports.resetSectionOmr = async (req, res) => {
    const section = normalizeSection(req.params.section);
    const examSettingId = Number(req.params.id);

    try {
        if (!Number.isInteger(examSettingId) || examSettingId <= 0) {
            throw new Error("A valid examination must be selected.");
        }

        const examination = await RtseExamSetting.getById(examSettingId);
        if (!examination) {
            throw new Error("The selected examination was not found.");
        }

        if (!(await isConfiguredSection(section, examSettingId))) {
            throw new Error("This section is not configured for the selected examination.");
        }

        const examYear = Number(examination.exam_year);
        if (!Number.isInteger(examYear) || examYear <= 0) {
            throw new Error("The selected examination has an invalid exam year.");
        }

        // Reset only this examination's OMR state.
        // Admit cards, roll numbers, Result QR tokens and attendance stay unchanged.
        await RtseApplication.resetOmrForSection(
            section,
            examYear,
            examSettingId
        );

        req.flash(
            "success",
            `OMR generation reset successfully for Section ${section}.`
        );
        return res.redirect("/admin/rtse");
    } catch (error) {
        console.error("RTSE Reset Section OMR Error:", error);
        req.flash(
            "error",
            error.message || "Unable to reset Section OMR generation."
        );
        return res.redirect("/admin/rtse");
    }
};

exports.downloadSectionOmrPdf = async (req, res) => {
    const section = normalizeSection(req.params.section);
    const examSettingId = Number(req.params.id);

    try {
        if (!Number.isInteger(examSettingId) || examSettingId <= 0) {
            throw new Error("A valid examination must be selected.");
        }

        const examination = await RtseExamSetting.getById(examSettingId);
        if (!examination) {
            throw new Error("The selected examination was not found.");
        }

        if (!(await isConfiguredSection(section, examSettingId))) {
            throw new Error("This section is not configured for the selected examination.");
        }

        const examYear = Number(examination.exam_year);
        if (!Number.isInteger(examYear) || examYear <= 0) {
            throw new Error("The selected examination has an invalid exam year.");
        }

        const omrStatus = await RtseApplication.getSectionOmrStatus(
            section,
            examYear,
            examSettingId
        );

        if (
            Number(omrStatus?.eligible || 0) === 0 ||
            Number(omrStatus?.omr_generated || 0) <
                Number(omrStatus?.eligible || 0)
        ) {
            req.flash(
                "error",
                `OMR has not been generated for Section ${section} in the selected examination.`
            );
            return res.redirect("/admin/rtse");
        }

        const students =
            await RtseApplication.getExamGeneratedAdmitCardStudents(
                section,
                examYear,
                examSettingId
            );

        if (!students.length) {
            req.flash(
                "error",
                `No generated admit-card students found for Section ${section} (${examYear}).`
            );
            return res.redirect("/admin/rtse");
        }

        const centreCache = new Map();
        const preparedStudents = [];

        for (const student of students) {
            preparedStudents.push(
                await prepareStudent(
                    { ...student, section },
                    examination,
                    centreCache
                )
            );
        }

        return await beginPdfResponse(
            res,
            `RTSE-OMR-Section-${section}-${examYear}.pdf`,
            preparedStudents
        );
    } catch (error) {
        console.error("RTSE Section OMR Error:", error);
        if (!res.headersSent) {
            req.flash(
                "error",
                error.message || "Unable to generate Section OMR sheets."
            );
            return res.redirect("/admin/rtse");
        }
        return res.end();
    }
};

exports.downloadStudentOmrPdf = async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        req.flash("error", "Invalid RTSE application.");
        return res.redirect("/admin/rtse");
    }

    try {
        const student = await RtseApplication.getById(id);

        if (!student) {
            req.flash("error", "RTSE application not found.");
            return res.redirect("/admin/rtse");
        }

        if (Number(student.admit_generated || 0) !== 1) {
            req.flash(
                "error",
                "OMR is available only after the admit card has been generated."
            );
            return res.redirect(`/admin/rtse/application/${id}`);
        }

        if (Number(student.omr_generated || 0) !== 1) {
            req.flash(
                "error",
                "OMR has not been generated for this student."
            );
            return res.redirect(`/admin/rtse/application/${id}`);
        }

               const section = normalizeSection(student.section);
        const examSettingId = Number(student.exam_setting_id);

        if (!Number.isInteger(examSettingId) || examSettingId <= 0) {
            throw new Error("Student examination configuration is missing.");
        }

        const examSetting = await RtseExamSetting.getById(examSettingId);

        if (!examSetting) {
            throw new Error("Student examination configuration was not found.");
        }

        if (!(await isConfiguredSection(section, examSettingId))) {
            req.flash(
                "error",
                "This section is not configured for the student's examination."
            );
            return res.redirect(`/admin/rtse/application/${id}`);
        }

        const examYear = Number(examSetting.exam_year);

        if (!Number.isInteger(examYear) || examYear <= 0) {
            throw new Error("The student's examination has an invalid exam year.");
        } 

        const centreCache = new Map();

        const preparedStudent = await prepareStudent(
            student,
            examSetting,
            centreCache
        );

        beginPdfResponse(
            res,
            `RTSE-OMR-${student.registration_no || id}-${examYear}.pdf`,
            [preparedStudent]
        );
    } catch (error) {
        console.error("RTSE Student OMR Error:", error);

        if (!res.headersSent) {
            req.flash("error", "Unable to generate student OMR sheet.");
            return res.redirect(`/admin/rtse/application/${id}`);
        }

        res.end();
    }
};
