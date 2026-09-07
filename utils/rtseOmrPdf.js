const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PAGE = {
    width: 595.28,
    height: 841.89
};

const M = 18;

const COLORS = {
    paper: "#fffde7",
    red: "#a51d2d",
    black: "#111111",
    line: "#222222",
    pink: "#f7c9d8",
    yellow: "#fff6a8",
    blue: "#17365d",
    grey: "#555555"
};

const SECTION_COLORS = {
    A: "#2f5597",
    B: "#d63384",
    C: "#198754",
    D: "#9c27b0",
    E: "#d97706"
};

const SECTION_OMR_PALETTE = {
    A: {
        primary: COLORS.red,
        light: COLORS.pink,
        band: COLORS.yellow
    },
    B: {
        primary: "#17365d",
        light: "#dcecf8",
        band: "#b9dff5"
    },
    C: {
        primary: "#245c2a",
        light: "#e4f6d9",
        band: "#b9e6b0"
    },
    D: {
        primary: "#a32963",
        light: "#f9dce8",
        band: "#efb5d0"
    },
    E: {
        primary: "#a85a24",
        light: "#fff4cf",
        band: "#f7dfa0"
    }
};

const LETTERS = ["A", "B", "C", "D"];

function text(value, fallback = "") {
    return String(value ?? fallback).trim();
}

function fitText(doc, value, x, y, width, maxSize, minSize = 6, options = {}) {
    let size = maxSize;
    const valueText = text(value);

    while (size > minSize) {
        doc.fontSize(size);
        const h = doc.heightOfString(valueText, {
            width,
            ...options
        });

        if (h <= (options.height || 18)) {
            break;
        }

        size -= 0.5;
    }

    doc.text(valueText, x, y, {
        width,
        ...options
    });
}

function drawBubble(
    doc,
    x,
    y,
    radius,
    filled = false,
    stroke = COLORS.red,
    label = ""
) {
    doc
        .circle(x, y, radius)
        .lineWidth(0.75)
        .stroke(stroke);

    if (filled) {
        doc
            .circle(x, y, Math.max(1.2, radius - 1.5))
            .fill(COLORS.black);
    }

    if (label) {
        doc
            .font("Times-Bold")
            .fontSize(6)
            .fillColor(stroke)
            .text(String(label), x - radius, y - 3, {
                width: radius * 2,
                height: radius * 2,
                align: "center",
                lineBreak: false
            });
    }
}

function drawOuterFrame(doc) {
    doc.rect(0, 0, PAGE.width, PAGE.height).fill(COLORS.paper);

    doc
        .rect(M - 5, 7, PAGE.width - (M - 5) * 2, PAGE.height - 14)
        .dash(4, { space: 3 })
        .lineWidth(1)
        .stroke(COLORS.line);

    doc
        .undash()
        .rect(M + 4, 17, PAGE.width - (M + 4) * 2, PAGE.height - 34)
        .lineWidth(1.1)
        .stroke(COLORS.line);
}

function cleanExamTitle(value, year) {
    let title = text(value, "RATABARI TALENT SEARCH EXAMINATION");
    const y = String(year || "").trim();

    if (y) {
        title = title
            .replace(new RegExp(`[-–—\\s]*${y}\\s*$`), "")
            .trim();
    }

    return title;
}

function drawHeader(doc, data, omrColors = SECTION_OMR_PALETTE.A) {
    const x = M + 4;
    const y = 17;
    const w = PAGE.width - (M + 4) * 2;

    doc
        .font("Times-Bold")
        .fontSize(16.5)
        .fillColor(omrColors.primary)
        .text(
            `${cleanExamTitle(data.exam_name, data.exam_year)}-${text(data.exam_year, "2026")}`,
            x,
            y + 4,
            {
                width: w,
                align: "center",
                height: 24
            }
        );

    doc
        .moveTo(x, 43)
        .lineTo(x + w, 43)
        .lineWidth(0.8)
        .stroke(COLORS.line);

    const sectionX = x + w - 90;

    doc
        .moveTo(sectionX, 43)
        .lineTo(sectionX, 91)
        .lineWidth(0.8)
        .stroke(COLORS.line);

    doc
        .font("Times-Bold")
        .fontSize(10)
        .fillColor(COLORS.black)
        .text(
            "NAME OF CANDIDATE:",
            x + 8,
            51,
            {
                width: 125
            }
        );

    fitText(
        doc,
        data.full_name,
        x + 145,
        50,
        sectionX - x - 153,
        10,
        7,
        { height: 15 }
    );

    doc
        .font("Times-Bold")
        .fontSize(10)
        .fillColor(COLORS.black)
        .text("ROLL:", x + 8, 72);

    const examYear = String(
        data.exam_year || data.application_year || ""
    ).trim();

    const rollPrefix = examYear
        ? `RTSE${examYear.slice(-2)}`
        : "RTSE";

    const rollNumber = String(
        data.roll_number ?? ""
    ).replace(/\D/g, "").slice(-4).padStart(4, "0");

    fitText(
        doc,
        rollPrefix,
        x + 45,
        71,
        65,
        10,
        7,
        { height: 15 }
    );

    doc
        .font("Times-Bold")
        .fontSize(10)
        .fillColor(COLORS.black)
        .text("NO:", x + 116, 72);

    fitText(
        doc,
        rollNumber,
        x + 142,
        71,
        83,
        10,
        7,
        { height: 15 }
    );

    doc
        .font("Times-Bold")
        .fontSize(9)
        .fillColor(COLORS.black)
        .text("SECTION", sectionX + 8, 51, {
            width: 74,
            align: "center"
        });

    doc
        .font("Times-Bold")
        .fontSize(21)
        .fillColor(omrColors.primary)
        .text(
            text(data.section).toUpperCase(),
            sectionX + 8,
            66,
            {
                width: 74,
                align: "center"
            }
        );
}

function drawNumberPanel(doc, data, omrColors = SECTION_OMR_PALETTE.A) {
    const x = M + 4;
    const y = 92;
    const w = 145;
    const h = 207;

    doc
        .rect(x, y, w, h)
        .lineWidth(1)
        .stroke(COLORS.line);

    doc
        .font("Times-Bold")
        .fontSize(13)
        .fillColor(omrColors.primary)
        .text("NUMBER", x + 8, y + 3, {
            width: w - 16,
            align: "center",
            underline: true
        });

    /*
     * IMPORTANT:
     * The reference uses FOUR NUMBER boxes.
     * Each box has one perfectly aligned 0-9 bubble column.
     */
    const boxW = 22;
    const boxH = 23;
    const gap = 7;

    const totalW = (boxW * 4) + (gap * 3);
    const startX = x + (w - totalW) / 2;

    const boxY = y + 27;
    const digitStartY = boxY + 35;
    const digitGap = 15.15;

    for (let col = 0; col < 4; col++) {
        const bx = startX + col * (boxW + gap);
        const centerX = bx + boxW / 2;

        // Number box.
        doc
            .rect(bx, boxY, boxW, boxH)
            .lineWidth(0.8)
            .stroke(COLORS.line);

        // 0-9 column directly under the same box.
        for (let digit = 0; digit <= 9; digit++) {
            const by = digitStartY + digit * digitGap;

            drawBubble(
                doc,
                centerX,
                by,
                5,
                false,
                omrColors.primary,
                String(digit)
            );
        }
    }
}

function drawInstructionPanel(doc, omrColors = SECTION_OMR_PALETTE.A) {
    const x = 163;
    const y = 92;
    const w = 291;
    const h = 207;

    doc
        .rect(x, y, w, h)
        .lineWidth(1)
        .stroke(COLORS.line);

    doc
        .font("Times-Bold")
        .fontSize(13)
        .fillColor(omrColors.primary)
        .text("INSTRUCTION", x + 8, y + 4, {
            width: w - 16,
            align: "center",
            underline: true
        });

    const items = [
        "Use a ballpoint pen. Use a blue or black ballpoint pen to fill out the OMR sheet.",
        "Darken circles completely. Darken the circles completely and don't leave any part of the circle blank.",
        "Don't mark multiple circles: Don't mark more than one circle for a question."
    ];

    items.forEach((item, i) => {
        const yy = y + 31 + i * 37;

        doc
            .font("Times-Bold")
            .fontSize(13)
            .fillColor(omrColors.primary)
        // Four-diamond instruction icon.
        const iconX = x + 16;
        const iconY = yy + 7;
        const diamond = 4.2;
        const gap = 1.4;

        [
            [iconX, iconY - diamond - gap],
            [iconX - diamond - gap, iconY],
            [iconX + diamond + gap, iconY],
            [iconX, iconY + diamond + gap]
        ].forEach(([cx, cy]) => {
            doc
                .moveTo(cx, cy - diamond)
                .lineTo(cx + diamond, cy)
                .lineTo(cx, cy + diamond)
                .lineTo(cx - diamond, cy)
                .closePath()
                .fill(omrColors.primary);
        });

        doc
            .font("Times-Roman")
            .fontSize(9.2)
            .fillColor(COLORS.black)
            .text(item, x + 30, yy - 1, {
                width: w - 40,
                lineGap: 1
            });
    });

    const exY = y + 137;

    doc
        .rect(x + 9, exY, w - 18, 59)
        .fillAndStroke(omrColors.light, omrColors.primary);

    doc
        .font("Times-Bold")
        .fontSize(9.5)
        .fillColor(omrColors.primary)
        .text("WRONG METHOD", x + 20, exY + 6, {
            width: 115,
            align: "center",
            underline: true
        });

    doc
        .font("Times-Bold")
        .fontSize(9.5)
        .fillColor(omrColors.primary)
        .text("CORRECT METHOD", x + 160, exY + 6, {
            width: 110,
            align: "center",
            underline: true
        });

    const wrongXs = [
        x + 34,
        x + 65,
        x + 96,
        x + 127
    ];

    // WRONG #1 — cross.
    drawBubble(
        doc,
        wrongXs[0],
        exY + 38,
        9
    );

    doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(COLORS.black)
        .text(
            "×",
            wrongXs[0] - 5,
            exY + 29
        );

    // WRONG #2 — PARTIALLY FILLED.
    // This is intentionally different from the
    // completely black correct bubble.
    drawBubble(
        doc,
        wrongXs[1],
        exY + 38,
        9,
        false
    );

    doc
        .save()
        .circle(
            wrongXs[1],
            exY + 38,
            7
        )
        .clip();

    doc
        .rect(
            wrongXs[1] - 7,
            exY + 31,
            7,
            14
        )
        .fill(COLORS.black);

    doc.restore();

    // WRONG #3 — crossed/scribbled.
    drawBubble(
        doc,
        wrongXs[2],
        exY + 38,
        9
    );

    doc
        .moveTo(
            wrongXs[2] - 7,
            exY + 31
        )
        .lineTo(
            wrongXs[2] + 7,
            exY + 45
        )
        .moveTo(
            wrongXs[2] + 7,
            exY + 31
        )
        .lineTo(
            wrongXs[2] - 7,
            exY + 45
        )
        .stroke();

    // WRONG #4 — tick.
    drawBubble(
        doc,
        wrongXs[3],
        exY + 38,
        9
    );

    doc
        .moveTo(
            wrongXs[3] - 5,
            exY + 38
        )
        .lineTo(
            wrongXs[3] - 1,
            exY + 43
        )
        .lineTo(
            wrongXs[3] + 7,
            exY + 31
        )
        .stroke();

    // Divider.
    doc
        .moveTo(x + 145, exY + 20)
        .lineTo(x + 145, exY + 49)
        .lineWidth(0.8)
        .stroke(COLORS.grey);

    // CORRECT METHOD — first three empty.
    drawBubble(
        doc,
        x + 177,
        exY + 38,
        9
    );

    drawBubble(
        doc,
        x + 208,
        exY + 38,
        9
    );

    drawBubble(
        doc,
        x + 239,
        exY + 38,
        9
    );

    // CORRECT #4 — completely filled.
    drawBubble(
        doc,
        x + 270,
        exY + 38,
        9,
        true
    );
}

function findCandidatePhoto(photo) {
    const raw = text(photo);

    if (!raw) {
        return "";
    }

    const filename = path.basename(raw);

    /*
     * RTSE photos are normally stored as filenames in the
     * database. Check the known upload locations first.
     */
    const candidates = [
        path.join(
            process.cwd(),
            "public",
            "uploads",
            "rtse",
            filename
        ),
        path.join(
            process.cwd(),
            "public",
            "uploads",
            filename
        ),
        path.join(
            process.cwd(),
            "public",
            raw
        ),
        path.join(
            process.cwd(),
            raw
        )
    ];

    for (const candidate of candidates) {
        try {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        } catch (error) {
            // Continue checking other locations.
        }
    }

    /*
     * Final fallback: locate the exact filename anywhere
     * below public/uploads without modifying the file.
     */
    const uploadRoot = path.join(
        process.cwd(),
        "public",
        "uploads"
    );

    if (!fs.existsSync(uploadRoot)) {
        return "";
    }

    const stack = [uploadRoot];

    while (stack.length) {
        const current = stack.pop();

        let entries;

        try {
            entries = fs.readdirSync(current, {
                withFileTypes: true
            });
        } catch (error) {
            continue;
        }

        for (const entry of entries) {
            const fullPath = path.join(
                current,
                entry.name
            );

            if (entry.isDirectory()) {
                stack.push(fullPath);
                continue;
            }

            if (
                entry.isFile() &&
                entry.name.toLowerCase() ===
                    filename.toLowerCase()
            ) {
                return fullPath;
            }
        }
    }

    console.warn(
        "RTSE OMR candidate photo not found:",
        filename
    );

    return "";
}

async function drawPhotoPanel(doc, data) {
    const x = 454;
    const y = 92;
    const w = PAGE.width - x - (M + 4);
    const h = 207;

    doc
        .rect(x, y, w, h)
        .lineWidth(1)
        .stroke(COLORS.line);

    // ==============================
    // STUDENT PHOTO
    // ==============================
    const photoX = x + 9;
    const photoY = y + 9;
    // 3:4 portrait student-photo box.
    const photoW = w - 18;
    const photoH = photoW * 4 / 3;

    doc
        .rect(photoX, photoY, photoW, photoH)
        .lineWidth(0.8)
        .stroke(COLORS.line);

    const photoPath = findCandidatePhoto(data.photo);

    if (photoPath) {
        try {
            // Load the actual uploaded file directly.
            // Using a buffer avoids path/stream resolution issues in PDFKit.
            const photoBuffer = fs.readFileSync(photoPath);

            /*
             * Normalize the student's exact uploaded image in memory.
             * The original upload is never modified.
             * PNG output gives PDFKit a reliable image representation
             * while preserving the student's actual photograph.
             */
            const normalizedPhoto = await sharp(photoBuffer)
                .rotate()
                .resize({
                    width: Math.round(photoW - 4),
                    height: Math.round(photoH - 4),
                    fit: "cover",
                    position: "centre"
                })
                .png()
                .toBuffer();

            // The image has already been resized internally to the
            // exact 4:3 photo area. Do not distort it in PDFKit.
            doc.image(
                normalizedPhoto,
                photoX + 2,
                photoY + 2,
                {
                    width: photoW - 4,
                    height: photoH - 4
                }
            );
        } catch (error) {
            console.error(
                "RTSE OMR photo rendering error:",
                photoPath,
                error
            );

            doc
                .font("Times-Bold")
                .fontSize(8)
                .fillColor(COLORS.grey)
                .text(
                    "CANDIDATE PHOTO",
                    photoX,
                    photoY + photoH / 2 - 5,
                    {
                        width: photoW,
                        align: "center"
                    }
                );
        }
    } else {
        doc
            .font("Times-Bold")
            .fontSize(8)
            .fillColor(COLORS.grey)
            .text(
                "CANDIDATE PHOTO",
                photoX,
                photoY + photoH / 2 - 5,
                {
                    width: photoW,
                    align: "center"
                }
            );
    }

    // ==============================
    // RESERVED QR SPACE
    // ==============================
    // QR functionality will be connected here later.
    const qrSize = 48;
    const qrX = x + (w - qrSize) / 2;
    const qrY = photoY + photoH + 10;

    doc
        .rect(qrX, qrY, qrSize, qrSize)
        .lineWidth(0.8)
        .stroke(COLORS.line);

    doc
        .font("Times-Bold")
        .fontSize(7)
        .fillColor(COLORS.grey)
        .text(
            "QR",
            qrX,
            qrY + qrSize / 2 - 4,
            {
                width: qrSize,
                align: "center"
            }
        );
}

function drawBarcode(doc, value, x, y, w, h) {
    const source = text(value, "RTSE");

    let pattern = "11010011100";

    for (let i = 0; i < source.length; i++) {
        const n = source.charCodeAt(i);

        for (let bit = 0; bit < 7; bit++) {
            pattern += ((n >> bit) & 1) ? "11" : "10";
        }

        pattern += "0";
    }

    pattern += "1100011101011";

    const barW = w / pattern.length;

    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === "1") {
            doc
                .rect(x + i * barW, y, Math.max(0.35, barW), h)
                .fill(COLORS.black);
        }
    }

    doc
        .font("Helvetica")
        .fontSize(6)
        .fillColor(COLORS.black)
        .text(source, x, y + h + 2, {
            width: w,
            align: "center"
        });
}

function drawSignatureArea(doc) {
    const x = M + 4;
    const y = 300;
    const w = PAGE.width - (M + 4) * 2;
    const h = 52;

    doc
        .rect(x, y, w, h)
        .lineWidth(1)
        .stroke(COLORS.line);

    const mid = x + w / 2;

    doc
        .moveTo(mid, y)
        .lineTo(mid, y + h)
        .stroke(COLORS.line);

    doc
        .rect(x + 10, y + 8, w / 2 - 20, 23)
        .lineWidth(0.8)
        .stroke("#777777");

    doc
        .rect(mid + 10, y + 8, w / 2 - 20, 23)
        .lineWidth(0.8)
        .stroke("#777777");

    doc
        .font("Times-Bold")
        .fontSize(9)
        .fillColor(COLORS.black)
        .text("CANDIDATE SIGNATURE", x, y + 35, {
            width: w / 2,
            align: "center"
        });

    doc
        .text("FULL SIGNATURE OF INVIGILATOR", mid, y + 35, {
            width: w / 2,
            align: "center"
        });
}

function drawQuestionGrid(doc, section = "A") {
    const sectionKey = text(section, "A").toUpperCase();
    const omrColors =
        SECTION_OMR_PALETTE[sectionKey] || SECTION_OMR_PALETTE.A;
    const x = M + 4;
    const y = 356;
    const w = PAGE.width - (M + 4) * 2;

    doc
        .font("Times-Bold")
        .fontSize(17)
        .fillColor(omrColors.primary)
        .text("OMR SHEET", x, y, {
            width: w,
            align: "center",
            underline: true
        });

    const gridY = 376;
    const colGap = 5;
    const colW = (w - colGap * 3) / 4;

    for (let col = 0; col < 4; col++) {
        const cx = x + col * (colW + colGap);
        drawQuestionColumn(
            doc,
            cx,
            gridY,
            colW,
            col * 25 + 1,
            omrColors
        );
    }
}

function drawQuestionColumn(
    doc,
    x,
    y,
    w,
    firstQuestion,
    omrColors = SECTION_OMR_PALETTE.A
) {
    const h = 428;

    doc
        .rect(x, y, w, h)
        .lineWidth(0.8)
        .stroke(COLORS.line);

    doc
        .rect(x, y, w, 21)
        .fill("#fffdf0")
        .stroke(COLORS.line);

    const qWidth = 42;

    /*
     * Fixed answer-circle centres.
     * The heading and every question row use the SAME
     * coordinates, so A/B/C/D stay perfectly aligned.
     */
    const answerAreaX = x + qWidth + 5;
    const answerAreaW = w - qWidth - 10;
    const answerGap = answerAreaW / 4;

    const answerCenters = [
        answerAreaX + answerGap * 0.5,
        answerAreaX + answerGap * 1.5,
        answerAreaX + answerGap * 2.5,
        answerAreaX + answerGap * 3.5
    ];

    doc
        .font("Times-Bold")
        .fontSize(8)
        .fillColor(omrColors.primary)
        .text("Q.No.", x + 3, y + 6, {
            width: qWidth,
            align: "center"
        });

    /*
     * A/B/C/D headings correspond exactly to the
     * centres of the bubbles below.
     */
    LETTERS.forEach((letter, i) => {
        doc
            .font("Times-Bold")
            .fontSize(8)
            .fillColor(omrColors.primary)
            .text(
                letter,
                answerCenters[i] - 4,
                y + 6,
                {
                    width: 8,
                    align: "center"
                }
            );
    });

    const rowH = (h - 21) / 25;

    for (let row = 0; row < 25; row++) {
        const q = firstQuestion + row;
        const yy = y + 21 + row * rowH;

        /*
         * Reference pattern:
         * 1-4 pink
         * 5-8 yellow
         * 9-12 pink
         * 13-16 yellow
         * ...
         */
        const band =
            Math.floor(row / 4) % 2 === 0
                ? omrColors.light
                : omrColors.band;

        doc
            .rect(
                x + 0.5,
                yy,
                w - 1,
                rowH + 0.2
            )
            .fill(band);

        doc
            .font("Times-Bold")
            .fontSize(7.2)
            .fillColor(COLORS.black)
            .text(
                String(q),
                x + 3,
                yy + rowH / 2 - 4,
                {
                    width: qWidth,
                    align: "center"
                }
            );

        LETTERS.forEach((letter, i) => {
            drawBubble(
                doc,
                answerCenters[i],
                yy + rowH / 2,
                5.2,
                false,
                omrColors.primary,
                letter
            );
        });

        doc
            .moveTo(x, yy + rowH)
            .lineTo(x + w, yy + rowH)
            .lineWidth(0.2)
            .stroke("#b48b96");
    }
}

async function renderOmrPage(doc, data) {
    const sectionKey = text(data.section, "A").toUpperCase();
    const omrColors =
        SECTION_OMR_PALETTE[sectionKey] || SECTION_OMR_PALETTE.A;

    drawOuterFrame(doc);
    drawHeader(doc, data, omrColors);
    drawNumberPanel(doc, data, omrColors);
    drawInstructionPanel(doc, omrColors);
    await drawPhotoPanel(doc, data);
    drawSignatureArea(doc);
    drawQuestionGrid(doc, data.section);
}

async function createOmrPdf(students) {
    const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        autoFirstPage: false,
        info: {
            Title: "RTSE OMR Answer Sheets",
            Author: "Al-Najat National Institution"
        }
    });

    for (const student of students) {
        doc.addPage();
        await renderOmrPage(doc, student);
    }

    return doc;
}

module.exports = {
    createOmrPdf,
    renderOmrPage,
    SECTION_COLORS
};
