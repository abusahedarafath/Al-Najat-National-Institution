"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const SiteSetting = require("../models/SiteSetting");

const MM = 72 / 25.4;
const PAGE_W = 210 * MM;
const PAGE_H = 297 * MM;

const NAVY = "#174a86";
const BLUE = "#2563a6";
const LIGHT_BLUE = "#eef6ff";
const PALE = "#f7fbff";
const BORDER = "#cbd5e1";
const TEXT = "#172033";
const MUTED = "#5d6b7d";
const WHITE = "#ffffff";

function mm(value) {
    return value * MM;
}

function safe(value, fallback = "—") {
    if (value === null || value === undefined || String(value).trim() === "") {
        return fallback;
    }

    return String(value).trim();
}

function findLogo(siteSettings) {
    /*
     * ============================================================
     * DYNAMIC SITE-SETTINGS LOGO
     * ============================================================
     *
     * The PDF always uses the logo currently configured in
     * Site Settings.
     *
     * Supported stored formats:
     *
     *   /uploads/organization/logo.png
     *   uploads/organization/logo.png
     *   /public/uploads/organization/logo.png
     *   https://arsp.co.in/uploads/organization/logo.png
     *   https://arsp.co.in/public/uploads/organization/logo.png
     *
     * The original uploaded logo is NEVER modified.
     */

    if (!siteSettings) {
        console.warn(
            "RTSE PDF: Site Settings object is missing."
        );
        return null;
    }

    const configuredLogo =
        siteSettings.logo ||
        siteSettings.organization_logo ||
        siteSettings.site_logo ||
        siteSettings.logo_url;

    if (!configuredLogo) {
        console.warn(
            "RTSE PDF: No logo configured in Site Settings."
        );
        return null;
    }

    let logoValue =
        String(configuredLogo).trim();

    if (!logoValue) {
        return null;
    }

    /*
     * Remove query/hash from URLs.
     */

    logoValue =
        logoValue.split("?")[0]
            .split("#")[0];

    /*
     * Convert a full HTTP/HTTPS URL into its pathname.
     */

    try {
        if (
            logoValue.startsWith("http://") ||
            logoValue.startsWith("https://")
        ) {
            logoValue =
                new URL(logoValue).pathname;
        }
    } catch (_) {}

    /*
     * Decode URL-encoded paths where possible.
     */

    try {
        logoValue =
            decodeURIComponent(logoValue);
    } catch (_) {}

    /*
     * Normalize Windows-style separators.
     */

    logoValue =
        logoValue.replace(/\\/g, "/");

    /*
     * Remove leading slash.
     */

    const relativeLogo =
        logoValue.replace(/^\/+/, "");

    const projectRoot =
        path.join(__dirname, "..");

    /*
     * Generate several safe candidates because Site Settings
     * may store either a public URL path or a filesystem-relative
     * upload path.
     */

    const candidates = [];

    function addCandidate(candidate) {
        if (
            candidate &&
            !candidates.includes(candidate)
        ) {
            candidates.push(candidate);
        }
    }

    /*
     * Direct project-relative path.
     */

    addCandidate(
        path.resolve(
            projectRoot,
            relativeLogo
        )
    );

    /*
     * Normal public URL:
     *
     * /uploads/...
     * -> project/public/uploads/...
     */

    if (
        relativeLogo.startsWith("uploads/")
    ) {
        addCandidate(
            path.resolve(
                projectRoot,
                "public",
                relativeLogo
            )
        );
    }

    /*
     * If the stored value already contains public/.
     */

    if (
        relativeLogo.startsWith("public/")
    ) {
        addCandidate(
            path.resolve(
                projectRoot,
                relativeLogo
            )
        );
    }

    /*
     * Site Settings stores the logo as a filename.
     *
     * The actual Site Settings upload directory is:
     *
     * public/uploads/site-settings/
     *
     * Therefore resolve the configured filename directly from
     * that directory.
     */

    addCandidate(
        path.resolve(
            projectRoot,
            "public",
            "uploads",
            "site-settings",
            path.basename(relativeLogo)
        )
    );

    /*
     * Keep the generic public/uploads fallback as well.
     */

    addCandidate(
        path.resolve(
            projectRoot,
            "public",
            "uploads",
            path.basename(relativeLogo)
        )
    );

    /*
     * Also support an uploads directory outside public.
     */

    if (
        relativeLogo.startsWith("uploads/")
    ) {
        addCandidate(
            path.resolve(
                projectRoot,
                relativeLogo
            )
        );
    }

    /*
     * Use the first real image file.
     */

    for (const candidate of candidates) {
        try {
            if (
                fs.existsSync(candidate) &&
                fs.statSync(candidate).isFile()
            ) {
                console.log(
                    "RTSE PDF: Using Site Settings logo:",
                    candidate
                );

                return candidate;
            }
        } catch (_) {}
    }

    console.warn(
        "RTSE PDF: Site Settings logo was configured but the file could not be resolved:",
        configuredLogo
    );

    console.warn(
        "RTSE PDF: Checked:",
        candidates
    );

    return null;
}

function drawHeader(doc, settings, siteSettings) {
    const x = mm(8);
    const y = mm(8);
    const w = PAGE_W - mm(16);
    const h = mm(48);

    doc.roundedRect(x, y, w, h, mm(3))
        .fillAndStroke(LIGHT_BLUE, NAVY);

    const logo = findLogo(siteSettings);

    if (logo) {
        try {
            doc.image(logo, x + mm(4), y + mm(4), {
                fit: [mm(28), mm(28)],
                align: "center",
                valign: "center"
            });
        } catch (_) {
            // Logo failure must never prevent PDF generation.
        }
    }

    const textX = x + mm(36);
    const textW = w - mm(40);

    doc.font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(NAVY)
        .text(
            safe(settings.organization_name),
            textX,
            y + mm(5),
            {
                width: textW,
                align: "center",
                lineBreak: false
            }
        );

    doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(TEXT)
        .text(
            safe(settings.exam_name),
            textX,
            y + mm(12),
            {
                width: textW,
                align: "center"
            }
        );

    doc.font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(BLUE)
        .text(
            safe(settings.pdf_title),
            textX,
            y + mm(24),
            {
                width: textW,
                align: "center",
                lineBreak: false
            }
        );

    doc.font("Helvetica")
        .fontSize(7.5)
        .fillColor(MUTED)
        .text(
            safe(settings.pdf_subtitle),
            textX,
            y + mm(31),
            {
                width: textW,
                align: "center"
            }
        );

    let contactY = y + mm(38);

    const contactParts = [];

    if (settings.website_name) {
        contactParts.push(safe(settings.website_name));
    }

    if (settings.website_url) {
        contactParts.push(safe(settings.website_url));
    }

    if (settings.information_contact) {
        contactParts.push(`Information & Assistance: ${safe(settings.information_contact)}`);
    }

    if (settings.official_email) {
        contactParts.push(`Email: ${safe(settings.official_email)}`);
    }

    if (settings.technical_contact) {
        contactParts.push(
            `For any technical assistance, please contact: ${safe(settings.technical_contact)}`
        );
    }

    doc.font("Helvetica")
        .fontSize(6.2)
        .fillColor(MUTED)
        .text(
            contactParts.join("  •  "),
            x + mm(4),
            contactY,
            {
                width: w - mm(8),
                align: "center",
                lineBreak: false
            }
        );
}

function drawColumnHeader(doc, y, columns, widths) {
    const x = mm(8);
    const totalW = PAGE_W - mm(16);

    doc.rect(x, y, totalW, mm(11))
        .fillAndStroke(NAVY, NAVY);

    let currentX = x;

    columns.forEach((column, index) => {
        doc.font("Helvetica-Bold")
            .fontSize(6.5)
            .fillColor(WHITE)
            .text(
                column,
                currentX + mm(1.5),
                y + mm(2.7),
                {
                    width: widths[index] - mm(3),
                    align: "center",
                    lineBreak: false
                }
            );

        currentX += widths[index];
    });
}

function drawCellText(doc, text, x, y, w, h, align = "left", bold = false) {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(7)
        .fillColor(TEXT)
        .text(
            safe(text),
            x + mm(1.5),
            y + mm(2.5),
            {
                width: w - mm(3),
                height: h - mm(4),
                align,
                ellipsis: true,
                lineGap: 0
            }
        );
}


async function generateSection(applications, section) {
    const RtseLoginInformationPdf =
        require("../models/RtseLoginInformationPdf");

    const settings =
        await RtseLoginInformationPdf.getSettings();

    const siteSettings =
        await SiteSetting.get();

    const outputDir = path.join(
        __dirname,
        "..",
        "storage",
        "rtse-login-information-pdf"
    );

    fs.mkdirSync(outputDir, { recursive: true });

    const safeSection = String(section || "SECTION")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "_");

    const fileName =
        `rtse-login-information-section-${safeSection}.pdf`;

    const filePath = path.join(outputDir, fileName);

    const doc = new PDFDocument({
        size: "A4",
        margins: {
            top: mm(6),
            bottom: mm(6),
            left: mm(8),
            right: mm(8)
        },
        autoFirstPage: true
    });

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    const pageLeft = mm(8);
    const contentWidth = PAGE_W - mm(16);

    /*
     * ============================================================
     * FORMAL HEADER
     * ============================================================
     */

    const headerY = mm(6);
    const headerHeight = mm(42);

    doc.roundedRect(
        pageLeft,
        headerY,
        contentWidth,
        headerHeight,
        mm(2.5)
    )
        .fillAndStroke(
            PALE,
            BORDER
        );

    let logoPath = null;

    try {
        logoPath = findLogo(siteSettings);
    } catch (_) {
        logoPath = null;
    }

    /*
     * Large existing ARSP logo.
     * The existing logo file is only READ, never modified.
     */

    if (
        logoPath &&
        fs.existsSync(logoPath)
    ) {
        try {
            doc.image(
                logoPath,
                pageLeft + mm(4),
                headerY + mm(4),
                {
                    fit: [
                        mm(28),
                        mm(30)
                    ],
                    align: "center",
                    valign: "center"
                }
            );
        } catch (_) {}
    }

    const organizationName = safe(
        settings.organization_name ||
        siteSettings?.organization_name ||
        siteSettings?.site_name ||
        "ACTIVE RURAL SOCIAL PROGRESS (ARSP)"
    );

    const examName = safe(
        settings.exam_name ||
        "RATABARI TALENT SEARCH EXAMINATION 2026"
    );

    const pdfTitle = safe(
        settings.pdf_title ||
        "STUDENT LOGIN INFORMATION"
    );

    /*
     * IMPORTANT:
     *
     * Organized by Active Rural Social Progress
     * appears ABOVE
     * STUDENT LOGIN INFORMATION
     */

    const pdfSubtitle = safe(
        settings.pdf_subtitle ||
        "Organized by Active Rural Social Progress"
    );

    const websiteName = safe(
        settings.website_name ||
        "ARSP"
    );

    const websiteUrl = safe(
        settings.website_url ||
        "https://arsp.co.in/"
    );

    const informationContact = safe(
        settings.information_contact ||
        ""
    );

    const officialEmail = safe(
        settings.official_email ||
        ""
    );

    const technicalContact = safe(
        settings.technical_contact ||
        "6901646612"
    );

    /*
     * Header text starts after the logo.
     */

    const headerTextX =
        pageLeft + mm(34);

    const headerTextWidth =
        contentWidth - mm(38);

    /*
     * Organization.
     */

    doc.font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(NAVY)
        .text(
            organizationName,
            headerTextX,
            headerY + mm(5),
            {
                width: headerTextWidth,
                align: "center",
                lineBreak: false,
                ellipsis: true
            }
        );

    /*
     * Exam.
     */

    doc.font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor(TEXT)
        .text(
            examName,
            headerTextX,
            headerY + mm(12),
            {
                width: headerTextWidth,
                align: "center",
                lineBreak: false,
                ellipsis: true
            }
        );

    /*
     * Organized by.
     */

    doc.font("Helvetica-Bold")
        .fontSize(8.2)
        .fillColor(NAVY)
        .text(
            pdfSubtitle,
            headerTextX,
            headerY + mm(18.5),
            {
                width: headerTextWidth,
                align: "center",
                lineBreak: false,
                ellipsis: true
            }
        );

    /*
     * Main title.
     */

    doc.font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(NAVY)
        .text(
            pdfTitle,
            headerTextX,
            headerY + mm(24.5),
            {
                width: headerTextWidth,
                align: "center",
                lineBreak: false,
                ellipsis: true
            }
        );

    /*
     * Thin separator.
     */

    doc.moveTo(
        pageLeft + mm(37),
        headerY + mm(31.5)
    )
        .lineTo(
            pageLeft + contentWidth - mm(4),
            headerY + mm(31.5)
        )
        .strokeColor(BORDER)
        .stroke();

    /*
     * Website.
     */

    doc.font("Helvetica-Bold")
        .fontSize(6.4)
        .fillColor(TEXT)
        .text(
            `${websiteName} • ${websiteUrl}`,
            pageLeft + mm(5),
            headerY + mm(34),
            {
                width: contentWidth - mm(10),
                align: "center",
                lineBreak: false,
                ellipsis: true
            }
        );

    /*
     * Contact line.
     */

    const contactParts = [];

    if (informationContact) {
        contactParts.push(
            `Information & Assistance: ${informationContact}`
        );
    }

    if (officialEmail) {
        contactParts.push(
            `Email: ${officialEmail}`
        );
    }

    if (technicalContact) {
        contactParts.push(
            `Technical Support: ${technicalContact}`
        );
    }

    doc.font("Helvetica")
        .fontSize(5.7)
        .fillColor(TEXT)
        .text(
            contactParts.join("  |  "),
            pageLeft + mm(5),
            headerY + mm(37.5),
            {
                width: contentWidth - mm(10),
                align: "center",
                lineBreak: false,
                ellipsis: true
            }
        );

    /*
     * ============================================================
     * SECTION BAR
     * ============================================================
     */

    const sectionY =
        headerY +
        headerHeight +
        mm(4);

    const sectionHeight = mm(10);

    doc.roundedRect(
        pageLeft,
        sectionY,
        contentWidth,
        sectionHeight,
        mm(1.8)
    )
        .fillAndStroke(
            NAVY,
            NAVY
        );

    doc.font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(WHITE)
        .text(
            `SECTION ${safeSection}`,
            pageLeft,
            sectionY + mm(2),
            {
                width: contentWidth,
                height: mm(7),
                align: "center",
                lineBreak: false
            }
        );

    /*
     * ============================================================
     * TABLE
     * ============================================================
     *
     * Available width:
     *
     * A4 = 210mm
     * Left/right = 8mm each
     * Total = 194mm
     *
     * Columns:
     *
     * Sr No       12
     * Name        34
     * Father      31
     * Class       16
     * Login       38
     * Password    38
     * Link        25
     *
     * TOTAL       194mm
     */

    const columns = [
        "Sr. No.",
        "Name",
        "Father Name",
        "Class",
        "Login ID / Registration Number",
        "Password",
        "Link"
    ];

    const widths = [
        mm(12),
        mm(34),
        mm(31),
        mm(16),
        mm(38),
        mm(38),
        mm(25)
    ];

    const totalW = widths.reduce(
        (sum, value) => sum + value,
        0
    );

    let tableY =
        sectionY +
        sectionHeight +
        mm(4);

    /*
     * Table header.
     */

    const tableHeaderHeight = mm(12);

    function drawTableHeader() {
        doc.rect(
            pageLeft,
            tableY,
            totalW,
            tableHeaderHeight
        )
            .fillAndStroke(
                NAVY,
                NAVY
            );

        let x = pageLeft;

        columns.forEach(
            (column, index) => {
                if (index > 0) {
                    doc.moveTo(
                        x,
                        tableY
                    )
                        .lineTo(
                            x,
                            tableY + tableHeaderHeight
                        )
                        .strokeColor(WHITE)
                        .stroke();
                }

                let fontSize = 7.2;

                if (index === 4) {
                    fontSize = 6.4;
                }

                doc.font("Helvetica-Bold")
                    .fontSize(fontSize)
                    .fillColor(WHITE)
                    .text(
                        column,
                        x + mm(1),
                        tableY + mm(3.2),
                        {
                            width:
                                widths[index] -
                                mm(2),
                            height:
                                tableHeaderHeight -
                                mm(4),
                            align: "center",
                            lineBreak:
                                index === 4,
                            ellipsis: false,
                            lineGap: 0
                        }
                    );

                x += widths[index];
            }
        );
    }

    drawTableHeader();

    tableY += tableHeaderHeight;

    /*
     * ============================================================
     * STUDENT ROWS
     * ============================================================
     *
     * Row height is NOT fixed.
     *
     * Every row is measured from the actual student information.
     * This keeps the boxes compact while giving the text enough
     * vertical space to remain clearly readable.
     */

    const passwordInstruction = safe(
        settings.password_instruction,
        "Your registered 10-digit mobile number is your password."
    );

    const loginUrl = safe(
        settings.student_login_url ||
        "https://arsp.co.in/rtse/student/login"
    );

    applications.forEach(
        (application, index) => {
            const values = [
                String(index + 1),
                safe(application.full_name),
                safe(application.father_name),
                `Class ${safe(application.class, "")}`,
                safe(application.registration_no),
                passwordInstruction,
                "Student Login"
            ];

            /*
             * ====================================================
             * FLEXIBLE ROW HEIGHT
             * ====================================================
             *
             * Measure the real text before drawing the row.
             *
             * The password column is allowed to wrap because the
             * complete password instruction must appear in every
             * student's Password box.
             */

            const rowFontSizes = [
                9.2,
                9.4,
                9.2,
                9.0,
                8.4,
                7.2,
                8.5
            ];

            const rowPaddingTop = mm(1.8);
            const rowPaddingBottom = mm(1.8);
            const minimumRowHeight = mm(11);

            let requiredTextHeight = 0;

            values.forEach(
                (value, columnIndex) => {
                    doc.font(
                        columnIndex === 0
                            ? "Helvetica-Bold"
                            : "Helvetica"
                    )
                        .fontSize(
                            rowFontSizes[columnIndex]
                        );

                    const textWidth =
                        widths[columnIndex] -
                        mm(3);

                    const measuredHeight =
                        doc.heightOfString(
                            String(value),
                            {
                                width: textWidth,
                                lineGap: 0,
                                lineBreak: true
                            }
                        );

                    requiredTextHeight =
                        Math.max(
                            requiredTextHeight,
                            measuredHeight
                        );
                }
            );

            /*
             * Compact flexible row:
             *
             * - never unnecessarily tall
             * - enough room for the largest wrapped text
             * - password instruction remains readable
             */

            const rowHeight = Math.max(
                minimumRowHeight,
                requiredTextHeight +
                    rowPaddingTop +
                    rowPaddingBottom
            );

            /*
             * Keep rows visually compact even when a long value
             * unexpectedly wraps many times.
             */

            const finalRowHeight = Math.min(
                rowHeight,
                mm(15)
            );

            /*
             * Keep a clean page if there are many students.
             */

            if (
                tableY + finalRowHeight >
                PAGE_H - mm(25)
            ) {
                doc.addPage();

                tableY = mm(10);

                drawTableHeader();

                tableY += tableHeaderHeight;
            }

            doc.rect(
                pageLeft,
                tableY,
                totalW,
                finalRowHeight
            )
                .fillAndStroke(
                    WHITE,
                    BORDER
                );

            let x = pageLeft;

            values.forEach(
                (value, columnIndex) => {
                    if (columnIndex > 0) {
                        doc.moveTo(
                            x,
                            tableY
                        )
                            .lineTo(
                                x,
                                tableY + rowHeight
                            )
                            .strokeColor(BORDER)
                            .stroke();
                    }

                    /*
                     * Font sizes:
                     *
                     * Student data is deliberately larger.
                     * Password instruction gets 3 readable lines.
                     */

                    /*
                     * Larger, readable student typography.
                     */

                    let fontSize =
                        rowFontSizes[columnIndex];

                    if (columnIndex === 0) {
                        fontSize = 9.2;
                    }

                    if (columnIndex === 4) {
                        fontSize = 8.4;
                    }

                    if (columnIndex === 5) {
                        fontSize = 7.2;
                    }

                    if (columnIndex === 6) {
                        fontSize = 8.5;
                    }

                    const centered =
                        columnIndex === 0 ||
                        columnIndex === 3 ||
                        columnIndex === 5 ||
                        columnIndex === 6;

                    /*
                     * Password:
                     *
                     * Every student's Password box contains
                     * the complete instruction.
                     */

                    if (columnIndex === 5) {
                        doc.font("Helvetica")
                            .fontSize(fontSize)
                            .fillColor(TEXT)
                            .text(
                                value,
                                x + mm(1.2),
                                tableY + rowPaddingTop,
                                {
                                    width:
                                        widths[columnIndex] -
                                        mm(2.4),
                                    height:
                                        finalRowHeight -
                                        rowPaddingTop -
                                        rowPaddingBottom,
                                    align: "center",
                                    lineBreak: true,
                                    ellipsis: false,
                                    lineGap: 0
                                }
                            );
                    } else {
                        /*
                         * Vertically centered single-line
                         * student information.
                         */

                        const textHeight =
                            mm(5);

                        const textY =
                            tableY +
                            (
                                finalRowHeight -
                                textHeight
                            ) / 2;

                        const options = {
                            width:
                                widths[columnIndex] -
                                mm(3),
                            height: textHeight,
                            align:
                                centered
                                    ? "center"
                                    : "left",
                            lineBreak: false,
                            ellipsis: true
                        };

                        doc.font(
                            columnIndex === 0
                                ? "Helvetica-Bold"
                                : "Helvetica"
                        )
                            .fontSize(fontSize)
                            .fillColor(TEXT);

                        if (columnIndex === 6) {
                            doc.text(
                                value,
                                x + mm(1.5),
                                textY,
                                {
                                    ...options,
                                    link: loginUrl,
                                    underline: true
                                }
                            );
                        } else {
                            doc.text(
                                value,
                                x + mm(1.5),
                                textY,
                                options
                            );
                        }
                    }

                    x += widths[columnIndex];
                }
            );

            tableY += finalRowHeight;
        }
    );

    /*
     * ============================================================
     * FORMAL IMPORTANT NOTE
     * ============================================================
     *
     * This mirrors the supplied reference design.
     */

    const noteHeight = mm(14);

    if (
        tableY + mm(4) + noteHeight >
        PAGE_H - mm(6)
    ) {
        doc.addPage();
        tableY = mm(10);
    }

    const noteY =
        tableY +
        mm(4);

    doc.roundedRect(
        pageLeft,
        noteY,
        contentWidth,
        noteHeight,
        mm(2)
    )
        .fillAndStroke(
            PALE,
            BORDER
        );

    /*
     * Vertical separator.
     */

    doc.moveTo(
        pageLeft + mm(45),
        noteY + mm(2)
    )
        .lineTo(
            pageLeft + mm(45),
            noteY + noteHeight - mm(2)
        )
        .strokeColor(BORDER)
        .stroke();

    doc.font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(NAVY)
        .text(
            "Important Note:",
            pageLeft + mm(5),
            noteY + mm(4.2),
            {
                width: mm(36),
                align: "left",
                lineBreak: false
            }
        );

    doc.font("Helvetica")
        .fontSize(7.8)
        .fillColor(TEXT)
        .text(
            passwordInstruction,
            pageLeft + mm(49),
            noteY + mm(4.5),
            {
                width: contentWidth - mm(55),
                height: mm(7),
                align: "left",
                lineBreak: false,
                ellipsis: true
            }
        );

    /*
     * NO FOOTER.
     */

    doc.end();

    await new Promise(
        (resolve, reject) => {
            stream.on("finish", resolve);
            stream.on("error", reject);
            doc.on("error", reject);
        }
    );

    return {
        fileName,
        filePath
    };
}

async function generate(application) {
    const RtseLoginInformationPdf =
        require("../models/RtseLoginInformationPdf");

    const settings = await RtseLoginInformationPdf.getSettings();
    const siteSettings = await SiteSetting.get();

    const outputDir = path.join(
        __dirname,
        "..",
        "storage",
        "rtse-login-information-pdf"
    );

    fs.mkdirSync(outputDir, { recursive: true });

    const safeRegistration =
        safe(application.registration_no, `application-${application.id}`)
            .replace(/[^a-zA-Z0-9_-]/g, "_");

    const fileName =
        `rtse-login-information-${safeRegistration}.pdf`;

    const filePath = path.join(outputDir, fileName);

    const doc = new PDFDocument({
        size: "A4",
        margins: {
            top: mm(8),
            bottom: mm(10),
            left: mm(8),
            right: mm(8)
        },
        autoFirstPage: true
    });

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    drawHeader(doc, settings, siteSettings);

    const columns = [
        "Sr. No.",
        "Name",
        "Father Name",
        "Class",
        "Login ID / Registration Number",
        "Password",
        "Link"
    ];

    const widths = [
        mm(13),
        mm(32),
        mm(31),
        mm(16),
        mm(38),
        mm(31),
        mm(33)
    ];

    let tableY = mm(64);

    drawColumnHeader(doc, tableY, columns, widths);
    tableY += mm(11);

    const rowHeight = mm(27);
    const rowX = mm(8);
    const totalW = PAGE_W - mm(16);

    let serialNumber = 1;

    // This feature is generated for the logged-in student.
    // The serial number is therefore the student's application-table
    // position when ordered alphabetically by name.
    try {
        const db = require("../config/database");

        const [rows] = await db.query(`
            SELECT COUNT(*) AS serial_no
            FROM rtse_applications
            WHERE application_year=?
              AND archive=0
              AND (
                    LOWER(full_name) < LOWER(?)
                    OR (
                        LOWER(full_name)=LOWER(?)
                        AND id <= ?
                    )
              )
        `, [
            application.application_year,
            application.full_name,
            application.full_name,
            application.id
        ]);

        serialNumber = Number(rows[0]?.serial_no || 1);
    } catch (_) {
        serialNumber = 1;
    }

    const values = [
        serialNumber,
        application.full_name,
        application.father_name,
        `Class ${application.class}`,
        application.registration_no,
        "**********",
        safe(settings.student_login_url)
    ];

    const passwordInstruction =
        safe(
            settings.password_instruction,
            "Your registered 10-digit mobile number is your password."
        );

    const estimatedLinkHeight = mm(14);

    if (tableY + rowHeight > PAGE_H - mm(15)) {
        doc.addPage();
        tableY = mm(12);
        drawColumnHeader(doc, tableY, columns, widths);
        tableY += mm(11);
    }

    doc.rect(rowX, tableY, totalW, rowHeight)
        .fillAndStroke(WHITE, BORDER);

    let currentX = rowX;

    values.forEach((value, index) => {
        if (index > 0) {
            doc.moveTo(currentX, tableY)
                .lineTo(currentX, tableY + rowHeight)
                .lineWidth(0.5)
                .stroke(BORDER);
        }

        drawCellText(
            doc,
            value,
            currentX,
            tableY,
            widths[index],
            rowHeight,
            index === 0 || index === 3 ? "center" : "left",
            index === 4
        );

        currentX += widths[index];
    });


    doc.font("Helvetica")
        .fontSize(5.5)
        .fillColor(BLUE)
        .text(
            "Student login",
            rowX + totalW - widths[6] + mm(1),
            tableY + mm(17),
            {
                width: widths[6] - mm(2),
                align: "center"
            }
        );

    tableY += rowHeight + mm(8);

    doc.roundedRect(
        rowX,
        tableY,
        totalW,
        mm(21),
        mm(2.5)
    )
        .fillAndStroke(PALE, BORDER);

    doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(NAVY)
        .text(
            "LOGIN INSTRUCTIONS",
            rowX + mm(5),
            tableY + mm(4),
            {
                width: totalW - mm(10),
                align: "left"
            }
        );

    doc.font("Helvetica")
        .fontSize(7)
        .fillColor(TEXT)
        .text(
            `1. Login ID: ${safe(application.registration_no)}`,
            rowX + mm(5),
            tableY + mm(9),
            {
                width: totalW - mm(10)
            }
        );

    doc.text(
        `2. Password: ${passwordInstruction}`,
        rowX + mm(5),
        tableY + mm(14),
        {
            width: totalW - mm(10)
        }
    );

    doc.end();

    await new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
        doc.on("error", reject);
    });

    return {
        fileName,
        filePath
    };
}

module.exports = {
    generate,
    generateSection
};
