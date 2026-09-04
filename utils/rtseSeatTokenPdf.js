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
    doc
        .rect(x, y, width, height)
        .stroke();

    const padding = 14;

    doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(examName, x + padding, y + 12, {
            width: width - padding * 2,
            align: "center"
        });

    let cursor = y + 43;

    doc
        .font("Helvetica")
        .fontSize(10)
        .text("Student Name:", x + padding, cursor, {
            width: width - padding * 2
        });

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(student.full_name || "", x + padding, cursor + 14, {
            width: width - padding * 2
        });

    cursor += 43;

    doc
        .font("Helvetica")
        .fontSize(10)
        .text(`Section: ${student.section || ""}`, x + padding, cursor, {
            width: width - padding * 2
        });

    cursor += 18;

    doc
        .text("Roll- RTSE26", x + padding, cursor, {
            width: width - padding * 2
        });

    cursor += 18;

    doc
        .text(`No- ${student.roll_no ?? ""}`, x + padding, cursor, {
            width: width - padding * 2
        });

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
    roomNo
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
        const logicalSeatNo = getLogicalCornerSeatNo(
            student,
            rows[Number(student.row_no)][side],
            student.row_no
        );

        if (logicalSeatNo === null) {
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
        layout: "portrait",
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

    if (!students.length) {
        throw new Error(
            "No locked student seats are available for token generation."
        );
    }

    const seatSystem =
        String(students[0].seat_system || "FULL").toUpperCase();

    if (seatSystem === "CORNER_TO_CORNER") {
        const left = await generateSidePdf(
            students,
            examName,
            "LEFT",
            shiftId,
            roomId,
            students[0].room_no
        );

        const right = await generateSidePdf(
            students,
            examName,
            "RIGHT",
            shiftId,
            roomId,
            students[0].room_no
        );

        return {
            seatSystem,
            files: [left, right]
        };
    }

    const full = await generateFullPdf(
        students,
        examName,
        shiftId,
        roomId,
        students[0].room_no
    );

    return {
        seatSystem,
        files: [full]
    };
}

module.exports = {
    generateRoomTokenPdfs
};
