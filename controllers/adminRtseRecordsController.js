const RtseRecords = require("../models/RtseRecords");
const QRCode = require("qrcode");
const SiteSetting = require("../models/SiteSetting");
const RtseExamSetting = require("../models/RtseExamSetting");
const RtseExamAttendance = require("../models/RtseExamAttendance");
const RtseCertificate = require("../models/RtseCertificate");
const RtseCertificateSetting = require("../models/RtseCertificateSetting");
const RtseCertificateCategorySetting = require("../models/RtseCertificateCategorySetting");
const RtseAdmitCardSetting = require("../models/RtseAdmitCardSetting");
const RtseCentre = require("../models/RtseCentre");

exports.recordsDashboard = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const year = String(req.query.year || "").trim();
        const centreId = String(req.query.centre || "").trim();

        const [years, centres, dashboard] = await Promise.all([
            RtseRecords.getYears(),
            RtseRecords.getCentres(year),
            RtseRecords.getDashboardData({
                search,
                year,
                centreId
            })
        ]);

        let drilldown = null;

        const drillSection = String(req.query.section || "").trim().toUpperCase();
        const drillSchoolId = String(req.query.school_id || "").trim();
        const drillAttendance = String(req.query.attendance || "").trim().toUpperCase();

        if (
            ["A", "B", "C", "D", "E"].includes(drillSection) ||
            /^\d+$/.test(drillSchoolId)
        ) {
            const students = await RtseRecords.getDrilldownStudents({
                search,
                year,
                centreId,
                section: drillSection,
                schoolId: drillSchoolId,
                attendance: drillAttendance
            });

            drilldown = {
                students,
                section: drillSection || null,
                schoolId: drillSchoolId || null,
                attendance: drillAttendance || null
            };
        }

        return res.render("admin/rtse/records", {
            title: "RTSE Records Dashboard",
            years,
            centres,
            dashboard,
            filters: {
                search,
                year,
                centreId
            },
            drilldown
        });
    } catch (error) {
        console.error("RTSE Records Dashboard error:", error);

        return res.status(500).render("error", {
            message: "Unable to load RTSE Records Dashboard."
        });
    }
};

exports.recordsSectionDashboard = async (req, res) => {
    try {
        const section = String(req.params.section || "").trim().toUpperCase();

        if (!["A", "B", "C", "D", "E"].includes(section)) {
            return res.status(404).render("error", {
                message: "Invalid RTSE section."
            });
        }

        const search = String(req.query.search || "").trim();
        const year = String(req.query.year || "").trim();
        const centreId = String(req.query.centre || "").trim();

        const attendance = String(req.query.attendance || "")
            .trim()
            .toUpperCase();

        if (!["PRESENT", "ABSENT"].includes(attendance)) {
            return res.status(400).render("error", {
                message: "Invalid attendance filter."
            });
        }

        const [years, centres, students] = await Promise.all([
            RtseRecords.getYears(),
            RtseRecords.getCentres(year),
            RtseRecords.getDrilldownStudents({
                search,
                year,
                centreId,
                section,
                attendance
            })
        ]);

        return res.render("admin/rtse/records-section", {
            title: `RTSE Records — Section ${section} — ${attendance}`,
            section,
            attendance,
            years,
            centres,
            students,
            filters: {
                search,
                year,
                centreId
            }
        });
    } catch (error) {
        console.error("RTSE Records Section error:", error);

        return res.status(500).render("error", {
            message: "Unable to load RTSE section records."
        });
    }
};

exports.recordsSchoolDashboard = async (req, res) => {
    try {
        const schoolId = String(req.params.schoolId || "").trim();

        if (!/^\d+$/.test(schoolId)) {
            return res.status(404).render("error", {
                message: "Invalid RTSE school."
            });
        }

        const search = String(req.query.search || "").trim();
        const year = String(req.query.year || "").trim();
        const centreId = String(req.query.centre || "").trim();

        const [years, centres, students] = await Promise.all([
            RtseRecords.getYears(),
            RtseRecords.getCentres(year),
            RtseRecords.getDrilldownStudents({
                search,
                year,
                centreId,
                schoolId
            })
        ]);

        const schoolName =
            students.length && students[0].school_name
                ? students[0].school_name
                : `School ${schoolId}`;

        return res.render("admin/rtse/records-school", {
            title: `RTSE Records — ${schoolName}`,
            schoolId,
            schoolName,
            years,
            centres,
            students,
            filters: {
                search,
                year,
                centreId
            }
        });
    } catch (error) {
        console.error("RTSE Records School error:", error);

        return res.status(500).render("error", {
            message: "Unable to load RTSE school records."
        });
    }
};

exports.recordsData = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const year = String(req.query.year || "").trim();
        const centreId = String(req.query.centre || "").trim();

        const dashboard = await RtseRecords.getDashboardData({
            search,
            year,
            centreId
        });

        return res.json({
            success: true,
            ...dashboard
        });
    } catch (error) {
        console.error("RTSE Records data error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load RTSE records."
        });
    }
};

exports.recordsCentres = async (req, res) => {
    try {
        const year = String(req.query.year || "").trim();

        const centres = await RtseRecords.getCentres(year);

        return res.json({
            success: true,
            centres
        });
    } catch (error) {
        console.error("RTSE Records centres error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load centres."
        });
    }
};

exports.recordsStudentDetails = async (req, res) => {
    try {
        const applicationId = Number(req.params.applicationId);

        if (!Number.isInteger(applicationId) || applicationId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid student record."
            });
        }

        const search = String(req.query.search || "").trim();
        const year = String(req.query.year || "").trim();
        const centreId = String(req.query.centre || "").trim();

        const record = await RtseRecords.getStudentRecordDetails(
            applicationId,
            {
                search,
                year,
                centreId
            }
        );

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Student record not found in the selected Records scope."
            });
        }

        if (
            record.attendance?.status === "PRESENT" &&
            record.result_qr_token
        ) {
            record.result_qr_data_url = await QRCode.toDataURL(
                record.result_qr_token,
                {
                    width: 220,
                    margin: 2,
                    errorCorrectionLevel: "M",
                    type: "image/png"
                }
            );
        } else {
            record.result_qr_data_url = null;
        }

        if (record.attendance?.qr_token) {
            record.attendance.admit_qr_data_url =
                await QRCode.toDataURL(
                    record.attendance.qr_token,
                    {
                        width: 220,
                        margin: 2,
                        errorCorrectionLevel: "M",
                        type: "image/png"
                    }
                );
        } else {
            record.attendance.admit_qr_data_url = null;
        }

        if (record.certificate?.qr_code) {
            record.certificate.qr_url =
                `/uploads/rtse-certificates/${encodeURIComponent(
                    record.certificate.qr_code
                )}`;
        } else {
            record.certificate.qr_url = null;
        }

        return res.json({
            success: true,
            record
        });
    } catch (error) {
        console.error(
            "RTSE Records student details error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load student record details."
        });
    }
};

// =====================================
// RTSE Records — Read-only Documents
// =====================================

async function getRecordsDocumentContext(req, res) {
    const applicationId = Number(req.params.applicationId);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
        res.status(400).render("error", {
            message: "Invalid RTSE student record."
        });
        return null;
    }

    const search = String(req.query.search || "").trim();
    const year = String(req.query.year || "").trim();
    const centreId = String(req.query.centre || "").trim();

    const record = await RtseRecords.getStudentRecordDetails(
        applicationId,
        { search, year, centreId }
    );

    if (!record) {
        res.status(404).render("error", {
            message: "Student record not found in the selected Records scope."
        });
        return null;
    }

    res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
    );

    return record;
}

exports.recordsRegistrationSlip = async (req, res) => {
    try {
        const record = await getRecordsDocumentContext(req, res);
        if (!record) return;

        return res.render(
            "rtse/acknowledgement",
            {
                title: "RTSE Registration Slip",
                application: record.application,
                siteSettings: await SiteSetting.get(),
                isRecords: true
            }
        );
    } catch (error) {
        console.error(
            "RTSE Records registration slip error:",
            error
        );

        return res.status(500).render("error", {
            message: "Unable to load RTSE registration slip."
        });
    }
};

exports.recordsApprovedSlip = async (req, res) => {
    try {
        const record = await getRecordsDocumentContext(req, res);
        if (!record) return;

        const application = record.application;

        if (
            String(application.application_status || "").toLowerCase() !==
            "approved"
        ) {
            return res.status(404).render("error", {
                message: "Approved slip is not available for this application."
            });
        }

        return res.render(
            "rtse/approved-slip",
            {
                title: "RTSE Approved Examination Slip",
                application,
                siteSettings: await SiteSetting.get()
            }
        );
    } catch (error) {
        console.error(
            "RTSE Records approved slip error:",
            error
        );

        return res.status(500).render("error", {
            message: "Unable to load RTSE approved slip."
        });
    }
};

exports.recordsAdmitCard = async (req, res) => {
    try {
        const record = await getRecordsDocumentContext(req, res);
        if (!record) return;

        const student = record.application;

        if (
            Number(student.admit_generated) !== 1 ||
            String(student.application_status || "").toLowerCase() !==
            "approved"
        ) {
            return res.status(404).render("error", {
                message: "Admit Card is not available for this application."
            });
        }

        // Records must remain strictly read-only.
        // Never call ensureForApplication() here.
        const attendance =
            await RtseExamAttendance.getByApplication(student.id);

        if (!attendance || !attendance.qr_token) {
            return res.status(404).render("error", {
                message: "Admit Card attendance QR record is not available."
            });
        }

        const ArspSetting = require("../models/ArspSetting");
        const setting = await ArspSetting.get();

        // The application year is an exam year, not an exam-setting ID.
        // Resolve the historical exam setting by exam_year.
        const db = require("../config/database");

        const [examRows] = await db.query(
            `SELECT *
             FROM rtse_exam_settings
             WHERE exam_year=?
             ORDER BY id DESC
             LIMIT 1`,
            [student.application_year]
        );

        const examSetting = examRows[0] || null;

        const admitCardSetting =
            await RtseAdmitCardSetting.get();

        let examShift = null;

        if (examSetting && student.section) {
            const configuredShifts =
                await RtseExamSetting.getShifts(examSetting.id);

            const studentSection =
                String(student.section)
                    .trim()
                    .toUpperCase();

            examShift =
                configuredShifts.find((shift) =>
                    Array.isArray(shift.sections) &&
                    shift.sections.some(
                        (section) =>
                            String(section.section || "")
                                .trim()
                                .toUpperCase() === studentSection
                    )
                ) || null;
        }

        let examCentre = null;

        if (student.school_id && student.application_year) {
            examCentre =
                await RtseCentre.getSchoolAssignment(
                    student.school_id,
                    student.application_year
                );
        }

        const qrData = await QRCode.toDataURL(
            attendance.qr_token,
            {
                width: 180,
                margin: 2,
                errorCorrectionLevel: "M"
            }
        );

        return res.render(
            "rtse/student-admit-card",
            {
                title: "RTSE Admit Card",
                setting,
                student,
                attendance,
                qrData,
                examSetting,
                examShift,
                examCentre,
                admitCardSetting,
                examYear:
                    examSetting?.exam_year ||
                    setting?.exam_year ||
                    student.application_year
            }
        );
    } catch (error) {
        console.error(
            "RTSE Records admit card error:",
            error
        );

        return res.status(500).render("error", {
            message: "Unable to load RTSE Admit Card."
        });
    }
};

exports.recordsCertificate = async (req, res) => {
    try {
        const record = await getRecordsDocumentContext(req, res);
        if (!record) return;

        const applicationId =
            Number(record.application.id);

        if (!Number.isInteger(applicationId) || applicationId <= 0) {
            return res.status(400).render("error", {
                message: "Invalid certificate application."
            });
        }

        const result = record.result;

        if (!result) {
            return res.status(404).render("error", {
                message: "Result is not available for this application."
            });
        }

        const sectionRank =
            Number(result.section_rank);

        /*
         * Records Dashboard is strictly read-only.
         *
         * Use the certificate that already exists in
         * rtse_certificates. Never generate or ensure a
         * certificate from the Records Dashboard.
         */
        let certificateType = "";

        if (sectionRank === 1) {
            certificateType = "Gold";
        } else if (sectionRank === 2) {
            certificateType = "Silver";
        } else if (sectionRank === 3) {
            certificateType = "Bronze";
        } else if (sectionRank >= 4 && sectionRank <= 10) {
            certificateType = "Merit";
        } else if (sectionRank >= 11) {
            certificateType = "Appreciation";
        } else {
            return res.status(404).render("error", {
                message: "A valid certificate rank is not available for this application."
            });
        }

        const certificate =
            await RtseCertificate.getByApplicationAndType(
                applicationId,
                certificateType
            );

        if (!certificate) {
            return res.status(404).render("error", {
                message:
                    `${certificateType} certificate is not available for this application.`
            });
        }

        const setting =
            await RtseExamSetting.get();

        const certificateSetting =
            await RtseCertificateSetting.get();

        const siteSettings =
            await SiteSetting.get();

        /*
         * Ranks 1–10 use the existing new certificate
         * template exactly as it is already used elsewhere.
         */
        if (sectionRank >= 1 && sectionRank <= 10) {
            const categoryKey =
                sectionRank === 1
                    ? "rank1"
                    : sectionRank === 2
                        ? "rank2"
                        : sectionRank === 3
                            ? "rank3"
                            : "merit";

            const certificateCategorySetting =
                await RtseCertificateCategorySetting.getByCategory(
                    categoryKey
                );

            const writingSkillComponent =
                Array.isArray(result.component_marks)
                    ? result.component_marks.find(
                        component => {
                            const name =
                                String(component.name || "")
                                    .toLowerCase()
                                    .replace(/\s+/g, "");

                            return name.includes("writingskill");
                        }
                    )
                    : null;

            let writingSkillGrade = "";

            if (writingSkillComponent) {
                const marks =
                    Number(writingSkillComponent.marks);

                const maximum =
                    Number(
                        writingSkillComponent.maximum_marks
                    );

                if (
                    Number.isFinite(marks) &&
                    Number.isFinite(maximum) &&
                    maximum > 0
                ) {
                    const percentage =
                        (marks / maximum) * 100;

                    if (percentage >= 90) {
                        writingSkillGrade = "A+";
                    } else if (percentage >= 80) {
                        writingSkillGrade = "A";
                    } else if (percentage >= 70) {
                        writingSkillGrade = "B+";
                    } else if (percentage >= 60) {
                        writingSkillGrade = "B";
                    } else if (percentage >= 50) {
                        writingSkillGrade = "C+";
                    } else if (percentage >= 40) {
                        writingSkillGrade = "C";
                    } else {
                        writingSkillGrade = "F";
                    }
                }
            }

            const certificateForTemplate = {
                registration_no:
                    certificate.registration_no,

                roll_no:
                    certificate.roll_no,

                full_name:
                    certificate.full_name,

                school_name:
                    certificate.school_name,

                section:
                    certificate.section,

                photo:
                    certificate.photo,

                section_rank:
                    certificate.section_rank,

                overall_rank:
                    certificate.overall_rank,

                certificate_no:
                    certificate.certificate_no,

                qr_code:
                    certificate.qr_code,

                writing_skill_grade:
                    writingSkillGrade
            };

            return res.render(
                "rtse-new-certificate",
                {
                    title: "RTSE New Certificate",
                    certificate: certificateForTemplate,
                    setting,
                    certificateSetting,
                    certificateCategorySetting,
                    siteSettings
                }
            );
        }

        /*
         * Section Rank 11+ uses the existing Appreciation
         * certificate renderer exactly as it already exists.
         */
        const categoryRows =
            await RtseCertificateCategorySetting.getAll();

        const certificateCategories = {};

        for (const row of categoryRows) {
            certificateCategories[row.category_key] = row;
        }

        return res.render(
            "admin/rtse/section-certificates",
            {
                title: "Appreciation Certificate",
                certificates: [certificate],
                setting,
                siteSettings,
                certificateSetting,
                certificateCategories,
                section: certificate.section
            }
        );

    } catch (error) {
        console.error(
            "RTSE Records certificate error:",
            error
        );

        return res.status(500).render("error", {
            message: "Unable to load RTSE certificate."
        });
    }
};
