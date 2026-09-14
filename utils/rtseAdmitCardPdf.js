"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const RtseExamSetting = require("../models/RtseExamSetting");
const RtseCentre = require("../models/RtseCentre");
const RtseExamAttendance = require("../models/RtseExamAttendance");
const ArspSetting = require("../models/ArspSetting");
const RtseAdmitCardSetting = require("../models/RtseAdmitCardSetting");

const MM = 72 / 25.4;
const PAGE_W = 210 * MM;
const PAGE_H = 297 * MM;

const NAVY = "#174a86";
const BLUE = "#2563a6";
const LIGHT_BLUE = "#eef6ff";
const PALE_BLUE = "#f7fbff";
const BORDER = "#174a86";
const TEXT = "#172033";
const MUTED = "#5d6b7d";
const WHITE = "#ffffff";
const GREEN = "#166534";
const LIGHT_GREEN = "#ecfdf5";

function mm(value) {
    return value * MM;
}

function safe(value, fallback = "—") {
    if (value === null || value === undefined || String(value).trim() === "") {
        return fallback;
    }
    return String(value).trim();
}

function truncate(value, max = 60) {
    const text = safe(value);
    if (text.length <= max) return text;
    return `${text.slice(0, Math.max(1, max - 1))}…`;
}

function formatExamDate(value) {
    if (!value) return "________________";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return safe(value, "________________");

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date);
}

function formatExamTime(value) {
    if (!value) return "________________";

    const raw = String(value).trim();

    const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match) {
        let hour = Number(match[1]);
        const minute = match[2];

        const suffix = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;

        return `${hour}:${minute} ${suffix}`;
    }

    return raw;
}

function splitRollNumber(value) {
    const raw = safe(value);

    if (raw === "—") {
        return {
            rollCode: "—",
            rollNumber: "—"
        };
    }

    const parts = raw.split("-");

    if (parts.length >= 2) {
        return {
            rollCode: parts.shift().trim() || "—",
            rollNumber: parts.join("-").trim() || "—"
        };
    }

    return {
        rollCode: raw,
        rollNumber: "—"
    };
}

function existingFile(...parts) {
    const file = path.join(__dirname, "..", "public", ...parts);
    return fs.existsSync(file) ? file : null;
}

function imagePath(folder, filename) {
    if (!filename) return null;

    const clean = String(filename)
        .replace(/^[/\\]+/, "")
        .replace(/^uploads[/\\]/i, "");

    const file = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        folder,
        clean
    );

    return fs.existsSync(file) ? file : null;
}

function drawRoundedBox(doc, x, y, w, h, options = {}) {
    const radius = options.radius || mm(2.5);

    doc.save();

    if (options.fill) {
        doc.roundedRect(x, y, w, h, radius)
            .fill(options.fill);
    }

    if (options.stroke) {
        doc.roundedRect(x, y, w, h, radius)
            .lineWidth(options.lineWidth || 0.8)
            .stroke(options.stroke);
    }

    doc.restore();
}

function drawLabelValue(doc, label, value, x, y, w, options = {}) {
    const labelSize = options.labelSize || 6.6;
    const valueSize = options.valueSize || 8.2;

    doc.font("Helvetica-Bold")
        .fontSize(labelSize)
        .fillColor(MUTED)
        .text(label.toUpperCase(), x, y, {
            width: w,
            height: mm(4),
            lineBreak: false
        });

    doc.font("Helvetica-Bold")
        .fontSize(valueSize)
        .fillColor(TEXT)
        .text(truncate(value, options.max || 42), x, y + mm(4.1), {
            width: w,
            height: mm(7),
            ellipsis: true,
            lineBreak: false
        });
}

function drawPhoto(doc, photo, x, y, w, h) {
    drawRoundedBox(doc, x, y, w, h, {
        fill: WHITE,
        stroke: BORDER,
        lineWidth: 1
    });

    if (!photo) {
        doc.font("Helvetica-Bold")
            .fontSize(7)
            .fillColor(MUTED)
            .text("PHOTO", x, y + h / 2 - mm(2), {
                width: w,
                align: "center"
            });
        return;
    }

    try {
        doc.save();
        doc.roundedRect(x + 1, y + 1, w - 2, h - 2, mm(2))
            .clip();

        doc.image(photo, x + 1, y + 1, {
            fit: [w - 2, h - 2],
            align: "center",
            valign: "center"
        });

        doc.restore();
    } catch (err) {
        doc.restore();

        doc.font("Helvetica-Bold")
            .fontSize(7)
            .fillColor(MUTED)
            .text("PHOTO", x, y + h / 2 - mm(2), {
                width: w,
                align: "center"
            });
    }
}

function drawQr(doc, qrBuffer, x, y, size) {
    drawRoundedBox(doc, x, y, size, size, {
        fill: WHITE,
        stroke: BORDER,
        lineWidth: 1
    });

    if (!qrBuffer) {
        doc.font("Helvetica-Bold")
            .fontSize(6)
            .fillColor(MUTED)
            .text("QR", x, y + size / 2 - mm(2), {
                width: size,
                align: "center"
            });
        return;
    }

    try {
        doc.image(qrBuffer, x + mm(1), y + mm(1), {
            fit: [size - mm(2), size - mm(2)],
            align: "center",
            valign: "center"
        });
    } catch (err) {
        doc.font("Helvetica-Bold")
            .fontSize(6)
            .fillColor(MUTED)
            .text("QR", x, y + size / 2 - mm(2), {
                width: size,
                align: "center"
            });
    }
}

function drawHeader(doc, data) {
    const x = mm(8);
    const y = mm(8);
    const w = PAGE_W - mm(16);
    const h = mm(28);

    drawRoundedBox(doc, x, y, w, h, {
        fill: LIGHT_BLUE,
        stroke: BORDER,
        lineWidth: 1
    });

    const logoX = x + mm(3);
    const logoY = y + mm(4);
    const logoSize = mm(20);

    if (data.logo) {
        try {
            doc.image(data.logo, logoX, logoY, {
                fit: [logoSize, logoSize],
                align: "center",
                valign: "center"
            });
        } catch (_) {}
    }

    const centerX = x + mm(28);
    const centerW = w - mm(58);

    doc.font("Helvetica-Bold")
        .fontSize(15)
        .fillColor(NAVY)
        .text(
            truncate(
                data.examName ||
                data.examSetting?.exam_name ||
                "Regional Talent Search Examination",
                65
            ),
            centerX,
            y + mm(4),
            {
                width: centerW,
                align: "center",
                height: mm(7),
                ellipsis: true,
                lineBreak: false
            }
        );

    doc.font("Helvetica")
        .fontSize(7)
        .fillColor(TEXT)
        .text("Organised by ARSP", centerX, y + mm(11), {
            width: centerW,
            align: "center"
        });

    doc.font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor(BLUE)
        .text(
            `RTSE ${safe(data.examYear, new Date().getFullYear())}`,
            centerX,
            y + mm(15),
            {
                width: centerW,
                align: "center"
            }
        );

    doc.font("Helvetica")
        .fontSize(6.5)
        .fillColor(MUTED)
        .text(
            "Academic excellence • Opportunity • Recognition",
            centerX,
            y + mm(19.5),
            {
                width: centerW,
                align: "center"
            }
        );

    const titleX = x + w - mm(31);
    doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(NAVY)
        .text("HALL", titleX, y + mm(6), {
            width: mm(25),
            align: "center"
        });

    doc.font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(NAVY)
        .text("TICKET", titleX, y + mm(12), {
            width: mm(25),
            align: "center"
        });

    doc.font("Helvetica-Bold")
        .fontSize(6)
        .fillColor(MUTED)
        .text("ADMIT CARD", titleX, y + mm(19), {
            width: mm(25),
            align: "center"
        });
}

function drawCandidateSection(doc, data) {
    const x = mm(8);
    const y = mm(39);
    const w = PAGE_W - mm(16);
    const h = mm(78);

    drawRoundedBox(doc, x, y, w, h, {
        fill: PALE_BLUE,
        stroke: BORDER,
        lineWidth: 1
    });

    doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(NAVY)
        .text("CANDIDATE DETAILS", x + mm(4), y + mm(3), {
            width: mm(80)
        });

    const photoW = mm(24);
    const photoH = mm(26);
    const photoX = x + w - mm(34);
    const photoY = y + mm(13);

    drawPhoto(doc, data.photo, photoX, photoY, photoW, photoH);

    const qrSize = mm(24);
    const qrX = x + w - mm(62);
    const qrY = y + mm(14);

    drawQr(doc, data.qrBuffer, qrX, qrY, qrSize);

    const contentX = x + mm(5);
    const contentW = w - mm(74);

    drawLabelValue(
        doc,
        "Registration No.",
        data.registrationNo,
        contentX,
        y + mm(13),
        mm(39)
    );

    drawLabelValue(
        doc,
        "Roll Code",
        data.rollCode,
        contentX + mm(42),
        y + mm(13),
        mm(34)
    );

    drawLabelValue(
        doc,
        "Roll Number",
        data.rollNumber,
        contentX + mm(79),
        y + mm(13),
        mm(38)
    );

    drawLabelValue(
        doc,
        "Candidate Name",
        data.fullName,
        contentX,
        y + mm(28),
        mm(58),
        { max: 38 }
    );

    drawLabelValue(
        doc,
        "Father's Name",
        data.fatherName,
        contentX + mm(61),
        y + mm(28),
        mm(56),
        { max: 38 }
    );

    drawLabelValue(
        doc,
        "School",
        data.schoolName,
        contentX,
        y + mm(43),
        mm(80),
        { max: 52 }
    );

    drawLabelValue(
        doc,
        "Class",
        data.studentClass,
        contentX + mm(83),
        y + mm(43),
        mm(34)
    );

    drawLabelValue(
        doc,
        "Section",
        data.section,
        contentX + mm(83),
        y + mm(58),
        mm(34)
    );

    doc.font("Helvetica")
        .fontSize(5.7)
        .fillColor(MUTED)
        .text(
            "Present this admit card at the examination centre.",
            x + mm(5),
            y + mm(68),
            {
                width: contentW,
                lineBreak: false
            }
        );
}

function drawExamInfo(doc, data) {
    const x = mm(8);
    const y = mm(120);
    const w = PAGE_W - mm(16);
    const h = mm(43);

    drawRoundedBox(doc, x, y, w, h, {
        fill: WHITE,
        stroke: BORDER,
        lineWidth: 1
    });

    doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(NAVY)
        .text("EXAMINATION INFORMATION", x + mm(4), y + mm(3));

    const gap = mm(3);
    const innerX = x + mm(4);
    const innerW = w - mm(8);
    const boxW = (innerW - gap * 2) / 3;
    const boxY = y + mm(12);
    const boxH = mm(10.5);

    const items = [
        ["Examination Date", data.examinationDate],
        ["Examination Centre", data.examinationCentre],
        ["Shift", data.shift],
        ["Reporting Time", data.reportingTime],
        ["Examination Time", data.examTime],
        ["Sections", data.examinationSections]
    ];

    items.forEach((item, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);

        const bx = innerX + col * (boxW + gap);
        const by = boxY + row * (boxH + mm(4));

        drawRoundedBox(doc, bx, by, boxW, boxH, {
            fill: LIGHT_BLUE,
            stroke: "#9ab9dc",
            lineWidth: 0.65,
            radius: mm(1.8)
        });

        doc.font("Helvetica-Bold")
            .fontSize(5.8)
            .fillColor(MUTED)
            .text(item[0].toUpperCase(), bx + mm(2), by + mm(1.5), {
                width: boxW - mm(4),
                height: mm(3.5),
                lineBreak: false
            });

        doc.font("Helvetica-Bold")
            .fontSize(7.3)
            .fillColor(TEXT)
            .text(truncate(item[1], 35), bx + mm(2), by + mm(5.2), {
                width: boxW - mm(4),
                height: mm(4),
                ellipsis: true,
                lineBreak: false
            });
    });
}

function drawImportantStrip(doc, data) {
    const x = mm(8);
    const y = mm(166);
    const w = PAGE_W - mm(16);
    const h = mm(9);

    drawRoundedBox(doc, x, y, w, h, {
        fill: LIGHT_GREEN,
        stroke: "#74a98b",
        lineWidth: 0.8,
        radius: mm(2)
    });

    doc.font("Helvetica-Bold")
        .fontSize(6.4)
        .fillColor(GREEN)
        .text("IMPORTANT:", x + mm(3), y + mm(2), {
            width: mm(25)
        });

    doc.font("Helvetica")
        .fontSize(6.2)
        .fillColor("#28543b")
        .text(
            truncate(
                data.importantMessage ||
                "Please report to the examination centre before the reporting time.",
                170
            ),
            x + mm(28),
            y + mm(2),
            {
                width: w - mm(32),
                height: mm(5),
                ellipsis: true,
                lineBreak: false
            }
        );
}

function drawInstructions(doc, data) {
    const x = mm(8);
    const y = mm(178);
    const w = PAGE_W - mm(16);
    const h = mm(105);

    drawRoundedBox(doc, x, y, w, h, {
        fill: PALE_BLUE,
        stroke: BORDER,
        lineWidth: 1
    });

    doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(NAVY)
        .text("IMPORTANT INSTRUCTIONS", x + mm(4), y + mm(3));

    const instructions = [
        data.instructions?.[0],
        data.instructions?.[1],
        data.instructions?.[2],
        data.instructions?.[3],
        data.instructions?.[4]
    ].filter(Boolean);

    const list = instructions.length
        ? instructions
        : [
            "Carry this admit card to the examination centre.",
            "Reach the examination centre before the reporting time.",
            "Follow all instructions given by the examination authorities.",
            "Do not carry prohibited electronic devices into the examination hall.",
            "Keep your admit card safe until the completion of the examination process."
        ];

    const startY = y + mm(14);
    const availableH = h - mm(29);
    const rowH = availableH / Math.max(list.length, 1);

    list.slice(0, 5).forEach((instruction, index) => {
        const iy = startY + index * rowH;

        doc.circle(x + mm(7), iy + mm(4.2), mm(1.7))
            .fill(BLUE);

        doc.font("Helvetica-Bold")
            .fontSize(6.5)
            .fillColor(NAVY)
            .text(`${index + 1}.`, x + mm(11), iy + mm(1.5), {
                width: mm(7)
            });

        doc.font("Helvetica")
            .fontSize(6.5)
            .fillColor(TEXT)
            .text(truncate(instruction, 185), x + mm(18), iy + mm(1.5), {
                width: w - mm(24),
                height: rowH - mm(2),
                ellipsis: true,
                lineBreak: false
            });
    });

    const signatureW = mm(42);
    const signatureH = mm(20);
    const signatureX = x + w - mm(51);
    const signatureY = y + h - mm(26);

    if (data.signature) {
        try {
            doc.image(data.signature, signatureX, signatureY, {
                fit: [signatureW, signatureH],
                align: "center",
                valign: "center"
            });
        } catch (_) {}
    }

    doc.moveTo(signatureX, signatureY + signatureH)
        .lineTo(signatureX + signatureW, signatureY + signatureH)
        .lineWidth(0.6)
        .stroke("#75879a");

    doc.font("Helvetica-Bold")
        .fontSize(5.8)
        .fillColor(TEXT)
        .text(
            safe(data.controllerTitle, "Controller / Authorised Signatory"),
            signatureX,
            signatureY + signatureH + mm(1),
            {
                width: signatureW,
                align: "center"
            }
        );

    doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(NAVY)
        .text("BEST OF LUCK!", x, y + h - mm(12), {
            width: w,
            align: "center"
        });

    doc.font("Helvetica")
        .fontSize(5.5)
        .fillColor(MUTED)
        .text(
            "ARSP • Regional Talent Search Examination",
            x,
            y + h - mm(6),
            {
                width: w,
                align: "center"
            }
        );
}

function prepareStudent(student, shared, qrBuffer) {
    const rolls = splitRollNumber(student.roll_no);

    const examSetting = shared.examSetting || {};
    const shift = shared.shiftMap.get(
        String(student.section || "").trim().toUpperCase()
    ) || null;

    const centre = shared.centres.get(Number(student.school_id)) || null;

    const examStart = formatExamTime(shift?.exam_start_time);
    const examEnd = formatExamTime(shift?.exam_end_time);

    let examTime = "________________";

    if (examStart !== "________________" && examEnd !== "________________") {
        examTime = `${examStart} – ${examEnd}`;
    } else if (examStart !== "________________") {
        examTime = examStart;
    }

    const sections = Array.isArray(shift?.sections)
        ? shift.sections
            .map(item => typeof item === "object" ? item?.section : item)
            .filter(Boolean)
        : [];

    const instructions = [
        shared.admitCardSetting?.instruction_1,
        shared.admitCardSetting?.instruction_2,
        shared.admitCardSetting?.instruction_3,
        shared.admitCardSetting?.instruction_4,
        shared.admitCardSetting?.instruction_5
    ];

    return {
        examYear:
            examSetting.exam_year ||
            shared.setting?.exam_year ||
            new Date().getFullYear(),

        examName:
            examSetting.exam_name ||
            shared.setting?.exam_name ||
            "Regional Talent Search Examination",

        registrationNo: student.registration_no,
        rollCode: rolls.rollCode,
        rollNumber: rolls.rollNumber,
        fullName: student.full_name,
        fatherName: student.father_name,
        schoolName: student.school_name,
        studentClass: student.class,
        section: student.section,

        photo: imagePath("rtse", student.photo),

        qrBuffer,

        examinationDate: formatExamDate(
            examSetting.exam_date ||
            examSetting.examination_date ||
            student.exam_date ||
            student.examination_date
        ),

        examinationCentre:
            centre?.centre_name ||
            centre?.centre_code ||
            "________________",

        shift:
            shift?.shift_name ||
            (shift?.shift_no ? `Shift ${shift.shift_no}` : "________________"),

        reportingTime: formatExamTime(shift?.reporting_time),

        examTime,

        examinationSections:
            sections.length
                ? sections.join(", ")
                : "________________",

        importantMessage:
            shared.admitCardSetting?.important_message ||
            shared.admitCardSetting?.importantMessage ||
            "Please report to the examination centre before the reporting time.",

        instructions,

        signature: imagePath(
            "rtse",
            shared.admitCardSetting?.signature_image
        ),

        controllerTitle:
            shared.admitCardSetting?.controller_title ||
            shared.admitCardSetting?.controllerTitle ||
            "Controller / Authorised Signatory"
    };
}

function drawAdmitCardPage(doc, data) {
    doc.rect(0, 0, PAGE_W, PAGE_H)
        .fill(WHITE);

    drawHeader(doc, data);
    drawCandidateSection(doc, data);
    drawExamInfo(doc, data);
    drawImportantStrip(doc, data);
    drawInstructions(doc, data);

    doc.font("Helvetica")
        .fontSize(4.8)
        .fillColor("#7b8794")
        .text(
            `Registration: ${safe(data.registrationNo)}   •   Roll: ${safe(data.rollCode)}-${safe(data.rollNumber)}`,
            mm(8),
            mm(290),
            {
                width: PAGE_W - mm(16),
                align: "left",
                lineBreak: false
            }
        );
}

async function loadSharedData(students, applicationYear) {
    const setting = await ArspSetting.get();
    const examSetting = await RtseExamSetting.get();
    const admitCardSetting = await RtseAdmitCardSetting.get();

    const shiftMap = new Map();

    if (examSetting) {
        const shifts = await RtseExamSetting.getShifts(examSetting.id);

        for (const shift of Array.isArray(shifts) ? shifts : []) {
            for (const section of Array.isArray(shift.sections) ? shift.sections : []) {
                const sectionName =
                    typeof section === "object"
                        ? section.section
                        : section;

                if (sectionName) {
                    shiftMap.set(
                        String(sectionName).trim().toUpperCase(),
                        shift
                    );
                }
            }
        }
    }

    const centres = new Map();

    for (const student of students) {
        if (!student.school_id) continue;

        const key = Number(student.school_id);

        if (centres.has(key)) continue;

        const centre = await RtseCentre.getSchoolAssignment(
            student.school_id,
            applicationYear
        );

        centres.set(key, centre || null);
    }

    return {
        setting,
        examSetting,
        admitCardSetting,
        shiftMap,
        centres
    };
}

async function generateRtseAdmitCardsPdf({
    res,
    students,
    applicationYear,
    filename
}) {
    if (!Array.isArray(students) || students.length === 0) {
        throw new Error("No generated admit cards found.");
    }

    const shared = await loadSharedData(students, applicationYear);

    const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        autoFirstPage: false,
        compress: true,
        info: {
            Title: filename || "RTSE Admit Cards",
            Author: "ARSP",
            Subject: `RTSE Admit Cards ${applicationYear}`
        }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${String(filename || "RTSE-Admit-Cards.pdf").replace(/"/g, "")}"`
    );
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

    doc.pipe(res);

    /*
     * HARD PAGE RULE:
     * Exactly one addPage() for every student.
     * drawAdmitCardPage() NEVER creates another page.
     */
    for (let index = 0; index < students.length; index++) {
        const student = students[index];

        let qrBuffer = null;

        try {
            if (
                Number(student.admit_generated) === 1 &&
                student.status === "Approved" &&
                student.roll_no
            ) {
                const attendance =
                    await RtseExamAttendance.ensureForApplication(student.id);

                if (attendance?.qr_token) {
                    qrBuffer = await QRCode.toBuffer(
                        attendance.qr_token,
                        {
                            width: 180,
                            margin: 2,
                            errorCorrectionLevel: "M",
                            type: "png"
                        }
                    );
                }
            }
        } catch (err) {
            console.error(
                `Unable to create QR for RTSE application ${student.id}:`,
                err
            );
        }

        const data = prepareStudent(
            student,
            shared,
            qrBuffer
        );

        /*
         * One student = one A4 page.
         */
        doc.addPage();

        drawAdmitCardPage(doc, data);
    }

    doc.end();
}

module.exports = {
    generateRtseAdmitCardsPdf
};
