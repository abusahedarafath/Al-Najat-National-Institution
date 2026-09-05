const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const db = require("../config/database");

const OUTPUT_DIR = path.join(
    __dirname,
    "..",
    "public",
    "generated",
    "rtse-seat-tokens"
);

function ensureOutputDir() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function safeFilePart(value) {
    return String(value || "")
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        || "room";
}

function getLogicalCornerSeatNo(seat, sideSeats, rowNo) {
    const ordered = [...sideSeats].sort(
        (a, b) => Number(a.seat_no) - Number(b.seat_no)
    );

    if (ordered.length <= 2) {
        return Number(seat.seat_no);
    }

    const first = Number(ordered[0].seat_no);
    const last = Number(ordered[ordered.length - 1].seat_no);
    const physical = Number(seat.seat_no);

    if (physical !== first && physical !== last) {
        return null;
    }

    const rowBase = (Number(rowNo) - 1) * 4;

    if (String(seat.position).toUpperCase() === "LEFT") {
        return rowBase + (physical === first ? 1 : 2);
    }

    return rowBase + (physical === first ? 3 : 4);
}

function drawToken(doc, student, seatNo, x, y, width, height, examName) {
    // Draw the complete token as a fixed rectangular area.
    // Nothing inside this function is allowed to create a new PDF page.
    doc.save();

    doc.rect(x, y, width, height).stroke();

    const padding = 12;
    const innerWidth = Math.max(20, width - padding * 2);

    // Keep every text block inside the token's fixed bounds.
    // The student name is deliberately constrained so it can never
    // push the following fields onto another PDF page.
    let examFontSize = 12;
    while (
        examFontSize > 8 &&
        doc.widthOfString(String(examName || ""), {
            font: "Helvetica-Bold",
            size: examFontSize
        }) > innerWidth
    ) {
        examFontSize -= 0.5;
    }

    doc
        .font("Helvetica-Bold")
        .fontSize(examFontSize)
        .text(String(examName || ""), x + padding, y + 9, {
            width: innerWidth,
            height: 18,
            align: "center",
            lineBreak: false
        });

    doc
        .font("Helvetica")
        .fontSize(9)
        .text("Student Name:", x + padding, y + 34, {
            width: innerWidth,
            height: 12,
            lineBreak: false
        });

    const studentName = String(student.full_name || "").trim();

    // Fit the student name into one fixed line.
    // This prevents long names from increasing token height.
    let nameFontSize = 10;
    while (
        nameFontSize > 6 &&
        doc.widthOfString(studentName, {
            font: "Helvetica-Bold",
            size: nameFontSize
        }) > innerWidth
    ) {
        nameFontSize -= 0.5;
    }

    let displayName = studentName;

    // Final safety truncation. The database value is NOT changed.
    while (
        displayName.length > 1 &&
        doc.widthOfString(displayName, {
            font: "Helvetica-Bold",
            size: nameFontSize
        }) > innerWidth
    ) {
        displayName = displayName.slice(0, -1);
    }

    if (displayName !== studentName && displayName.length > 3) {
        displayName = displayName.slice(0, -3).trimEnd() + "...";
    }

    doc
        .font("Helvetica-Bold")
        .fontSize(nameFontSize)
        .text(displayName, x + padding, y + 48, {
            width: innerWidth,
            height: 14,
            lineBreak: false
        });

    doc
        .font("Helvetica")
        .fontSize(9)
        .text(`Section: ${student.section || ""}`, x + padding, y + 69, {
            width: innerWidth,
            height: 12,
            lineBreak: false
        });

    doc
        .font("Helvetica")
        .fontSize(9)
        .text("Roll- RTSE26", x + padding, y + 87, {
            width: innerWidth,
            height: 12,
            lineBreak: false
        });

    doc
        .font("Helvetica")
        .fontSize(9)
        .text(`No- ${student.roll_no ?? ""}`, x + padding, y + 105, {
            width: innerWidth,
            height: 12,
            lineBreak: false
        });

    doc.restore();
}

function finishDocument(doc, outputPath) {
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(outputPath);

        stream.on("finish", () => resolve(outputPath));
        stream.on("error", reject);

        doc.pipe(stream);
        doc.end();
    });
}

async function getExamName() {
    const [rows] = await db.query(`
        SELECT exam_name
        FROM rtse_exam_settings
        ORDER BY id DESC
        LIMIT 1
    `);

    return rows[0]?.exam_name || "RTSE Examination";
}

async function getRoomTokenStudents(shiftId, roomId, applicationYear) {
    const [rows] = await db.query(`
        SELECT
            a.id AS application_id,
            a.full_name,
            a.section,
            a.roll_no,
            a.roll_number,
            sp.id AS seat_id,
            sp.row_no,
            sp.seat_no,
            sp.position,
            r.seat_system,
            r.room_no
        FROM rtse_applications a
        INNER JOIN rtse_seat_plan_seats sp
            ON sp.id = a.seat_id
        INNER JOIN rtse_seat_plan_rooms r
            ON r.id = sp.room_id
        WHERE a.archive = 0
          AND a.status = 'Approved'
          AND a.application_year = ?
          AND a.shift_id = ?
          AND a.room_id = ?
          AND a.seat_id IS NOT NULL
          AND sp.is_locked = 1
        ORDER BY
            sp.row_no ASC,
            sp.seat_no ASC
    `, [
        applicationYear,
        shiftId,
        roomId
    ]);

    return rows;
}

async function generateFullPdf(students, examName, shiftId, roomId, roomNo) {
    ensureOutputDir();

    const outputPath = path.join(
        OUTPUT_DIR,
        `RTSE-${safeFilePart(shiftId)}-Room-${safeFilePart(roomNo)}-FULL.pdf`
    );

    const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 24
    });

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    const columns = 4;
    const rowsPerPage = 4;
    const gap = 10;

    const tokenWidth =
        (pageWidth - doc.page.margins.left - doc.page.margins.right -
            gap * (columns - 1)) / columns;

    const tokenHeight =
        (pageHeight - doc.page.margins.top - doc.page.margins.bottom -
            gap * (rowsPerPage - 1)) / rowsPerPage;

    for (let index = 0; index < students.length; index++) {
        if (index > 0 && index % 16 === 0) {
            doc.addPage();
        }

        const pageIndex = index % 16;
        const row = Math.floor(pageIndex / columns);
        const column = pageIndex % columns;

        const x =
            doc.page.margins.left +
            column * (tokenWidth + gap);

        const y =
            doc.page.margins.top +
            row * (tokenHeight + gap);

        const student = students[index];

        drawToken(
            doc,
            student,
            student.seat_no,
            x,
            y,
            tokenWidth,
            tokenHeight,
            examName
        );
    }

    await finishDocument(doc, outputPath);

    return {
        side: "FULL",
        path: outputPath,
        url: `/generated/rtse-seat-tokens/${path.basename(outputPath)}`
    };
}

async function generateSidePdf(
    students,
    examName,
    side,
    shiftId,
    roomId,
    roomNo,
    usePhysicalSeatNo = false,
    landscape = false
) {
    ensureOutputDir();

    const sideStudents = students
        .filter(
            student =>
                String(student.position || "").toUpperCase() === side
        )
        .sort((a, b) => {
            if (Number(a.row_no) !== Number(b.row_no)) {
                return Number(a.row_no) - Number(b.row_no);
            }

            return Number(a.seat_no) - Number(b.seat_no);
        });

    const rows = {};

    for (const student of students) {
        const key = Number(student.row_no);

        if (!rows[key]) {
            rows[key] = {
                LEFT: [],
                RIGHT: []
            };
        }

        const position =
            String(student.position || "").toUpperCase();

        if (rows[key][position]) {
            rows[key][position].push(student);
        }
    }

    const prepared = [];

    for (const student of sideStudents) {
        const logicalSeatNo = usePhysicalSeatNo
            ? Number(student.seat_no)
            : getLogicalCornerSeatNo(
                  student,
                  rows[Number(student.row_no)][side],
                  student.row_no
              );

        if (!Number.isFinite(logicalSeatNo) || logicalSeatNo <= 0) {
            continue;
        }

        prepared.push({
            ...student,
            logical_seat_no: logicalSeatNo
        });
    }

    const outputPath = path.join(
        OUTPUT_DIR,
        `RTSE-${safeFilePart(shiftId)}-Room-${safeFilePart(roomNo)}-${side}.pdf`
    );

    const doc = new PDFDocument({
        size: "A4",
        layout: landscape ? "landscape" : "portrait",
        margin: 28
    });

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    const columns = 2;
    const gap = 12;
    const tokenWidth =
        (pageWidth - doc.page.margins.left - doc.page.margins.right -
            gap) / columns;

    const tokenHeight = 125;
    const top = doc.page.margins.top;
    const bottom = doc.page.height - doc.page.margins.bottom;
    const rowsPerPage = Math.max(
        1,
        Math.floor(
            (bottom - top + gap) /
            (tokenHeight + gap)
        )
    );

    const tokensPerPage = rowsPerPage * columns;

    for (let index = 0; index < prepared.length; index++) {
        if (index > 0 && index % tokensPerPage === 0) {
            doc.addPage();
        }

        const pageIndex = index % tokensPerPage;
        const row = Math.floor(pageIndex / columns);
        const column = pageIndex % columns;

        const x =
            doc.page.margins.left +
            column * (tokenWidth + gap);

        const y =
            top +
            row * (tokenHeight + gap);

        const student = prepared[index];

        drawToken(
            doc,
            student,
            student.logical_seat_no,
            x,
            y,
            tokenWidth,
            tokenHeight,
            examName
        );
    }

    await finishDocument(doc, outputPath);

    return {
        side,
        path: outputPath,
        url: `/generated/rtse-seat-tokens/${path.basename(outputPath)}`
    };
}

async function generateRoomTokenPdfs(
    shiftId,
    roomId,
    applicationYear
) {
    const examName = await getExamName();

    const students = await getRoomTokenStudents(
        shiftId,
        roomId,
        applicationYear
    );

    /*
     * Always remove the previous PDFs for this exact room first.
     * This prevents stale FULL/LEFT/RIGHT token files remaining
     * after seats or students are unlocked.
     */
    let roomNo = null;

    if (students.length) {
        roomNo = students[0].room_no;
    } else {
        const [rooms] = await db.query(
            `
            SELECT room_no
            FROM rtse_seat_plan_rooms
            WHERE id = ?
              AND shift_id = ?
              AND application_year = ?
            LIMIT 1
            `,
            [
                roomId,
                shiftId,
                applicationYear
            ]
        );

        roomNo = rooms[0]?.room_no || roomId;
    }

    const safeShift = safeFilePart(shiftId);
    const safeRoom = safeFilePart(roomNo);

    const staleFiles = [
        path.join(
            OUTPUT_DIR,
            `RTSE-${safeShift}-Room-${safeRoom}-FULL.pdf`
        ),
        path.join(
            OUTPUT_DIR,
            `RTSE-${safeShift}-Room-${safeRoom}-LEFT.pdf`
        ),
        path.join(
            OUTPUT_DIR,
            `RTSE-${safeShift}-Room-${safeRoom}-RIGHT.pdf`
        )
    ];

    for (const staleFile of staleFiles) {
        try {
            if (fs.existsSync(staleFile)) {
                fs.unlinkSync(staleFile);
            }
        } catch (error) {
            console.error(
                "Unable to remove stale RTSE token PDF:",
                staleFile,
                error
            );
        }
    }

    /*
     * An unlocked/empty room has no token PDF.
     * Returning an empty result is intentional.
     */
    if (!students.length) {
        return {
            seatSystem: null,
            files: []
        };
    }

    const seatSystem =
        String(
            students[0].seat_system || "FULL"
        ).toUpperCase();

    if (seatSystem === "CORNER_TO_CORNER") {
        const full = await generateFullPdf(
            students,
            examName,
            shiftId,
            roomId,
            students[0].room_no
        );

        const left = await generateSidePdf(
            students,
            examName,
            "LEFT",
            shiftId,
            roomId,
            students[0].room_no,
            false,
            false
        );

        const right = await generateSidePdf(
            students,
            examName,
            "RIGHT",
            shiftId,
            roomId,
            students[0].room_no,
            false,
            false
        );

        return {
            seatSystem,
            files: [full, left, right]
        };
    }

    const full = await generateFullPdf(
        students,
        examName,
        shiftId,
        roomId,
        students[0].room_no
    );

    /*
     * FULL seat system:
     * Generate FULL + LEFT + RIGHT token PDFs.
     *
     * All three PDFs are A4 landscape/horizontal.
     */
    const left = await generateSidePdf(
        students,
        examName,
        "LEFT",
        shiftId,
        roomId,
        students[0].room_no,
        true,
        true
    );

    const right = await generateSidePdf(
        students,
        examName,
        "RIGHT",
        shiftId,
        roomId,
        students[0].room_no,
        true,
        true
    );

    return {
        seatSystem: "FULL",
        files: [full, left, right]
    };
}
module.exports = {
    generateRoomTokenPdfs
};
