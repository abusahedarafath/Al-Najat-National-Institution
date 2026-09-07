const RtseSetting = require("../models/RtseSetting");
const RtseApplication = require("../models/RtseApplication");
const RtseCentre = require("../models/RtseCentre");
const RtseExamSetting = require("../models/RtseExamSetting");
const { createOmrPdf } = require("../utils/rtseOmrPdf");

const VALID_SECTIONS = ["A", "B", "C", "D", "E"];

function normalizeSection(value) {
    return String(value || "").trim().toUpperCase();
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
                console.error("RTSE OMR centre lookup error:", error);
            }

            centreCache.set(cacheKey, centreName);
        }
    }

    return {
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
        photo: student.photo
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

exports.downloadSectionOmrPdf = async (req, res) => {
    const section = normalizeSection(req.params.section);

    if (!VALID_SECTIONS.includes(section)) {
        req.flash("error", "Invalid RTSE section.");
        return res.redirect("/admin/rtse");
    }

    try {
        const setting = await RtseSetting.get();
        const examYear = Number(setting?.exam_year);

        if (!examYear) {
            throw new Error("Active RTSE exam year is not configured.");
        }

        const examSetting = await RtseExamSetting.get();

        const students =
            await RtseApplication.getGeneratedAdmitCardStudents(
                section,
                examYear
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
                    {
                        ...student,
                        section
                    },
                    examSetting,
                    centreCache
                )
            );
        }

        beginPdfResponse(
            res,
            `RTSE-OMR-Section-${section}-${examYear}.pdf`,
            preparedStudents
        );
    } catch (error) {
        console.error("RTSE Section OMR Error:", error);

        if (!res.headersSent) {
            req.flash("error", "Unable to generate Section OMR sheets.");
            return res.redirect("/admin/rtse");
        }

        res.end();
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

        const section = normalizeSection(student.section);

        if (!VALID_SECTIONS.includes(section)) {
            req.flash("error", "Invalid student section.");
            return res.redirect(`/admin/rtse/application/${id}`);
        }

        const setting = await RtseSetting.get();
        const examYear = Number(
            setting?.exam_year || student.application_year
        );

        if (!examYear) {
            throw new Error("Active RTSE exam year is not configured.");
        }

        const examSetting = await RtseExamSetting.get();
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
