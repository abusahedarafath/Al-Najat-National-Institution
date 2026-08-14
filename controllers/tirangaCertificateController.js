const TirangaCertificate = require("../models/TirangaCertificate");

const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const SVGtoPDF = require("svg-to-pdfkit");

function safe(value) {
    return String(value || "").trim();
}

function imagePath(filename) {

    if (!filename) return null;

    const p = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "tiranga",
        filename
    );

    return fs.existsSync(p) ? p : null;
}

exports.form = async (req, res) => {

    try {

        const settings = await TirangaCertificate.getSettings();

        if (!settings || !settings.enabled) {
            return res.status(403).render("tiranga/disabled", {
                title: "Tiranga Certificate"
            });
        }

        res.render("tiranga/form", {
            title: "Tiranga Certificate",
            settings
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Unable to load Tiranga Certificate.");
    }
};


exports.generate = async (req, res) => {

    try {

        const settings = await TirangaCertificate.getSettings();

        if (!settings || !settings.enabled) {
            return res.status(403).send(
                "Tiranga Certificate generation is currently disabled."
            );
        }

        const fullName = safe(req.body.full_name);
        const fatherName = safe(req.body.father_name);
        const villageName = safe(req.body.village_name);
        const postOffice = safe(req.body.post_office);
        const policeStation = safe(req.body.police_station);
        const mobile = safe(req.body.mobile);

        if (!fullName) {
            return res.status(400).send("Please enter your name.");
        }

        if (!fatherName) {
            return res.status(400).send("Please enter your father's name.");
        }

        if (!villageName) {
            return res.status(400).send("Please enter your village name.");
        }

        if (!postOffice) {
            return res.status(400).send("Please enter your post office.");
        }

        if (!policeStation) {
            return res.status(400).send("Please enter your police station.");
        }

        if (!mobile) {
            return res.status(400).send("Please enter your mobile number.");
        }

        // Accept common Indian mobile formats while keeping the database clean.
        const normalizedMobile = mobile.replace(/[\s-]/g, "");

        if (!/^(?:\+91)?[6-9]\d{9}$/.test(normalizedMobile)) {
            return res.status(400).send("Please enter a valid Indian mobile number.");
        }

        const certificateNo =
            await TirangaCertificate.generateCertificateNo();

        await TirangaCertificate.createCertificate({
            certificate_no: certificateNo,
            full_name: fullName,
            father_name: fatherName,
            village_name: villageName,
            post_office: postOffice,
            police_station: policeStation,
            mobile: normalizedMobile
        });

        
        // QR is verified by the official ARSP website scanner.
        const scannerBase =
            `${req.protocol}://${req.get("host")}`;

        const tirangaVerifyUrl =
            `${scannerBase}/arsp/tiranga/verify/${encodeURIComponent(certificateNo)}`;

        const qrData = await QRCode.toDataURL(
            tirangaVerifyUrl,
            {
                width: 220,
                margin: 2,
                errorCorrectionLevel: "M"
            }
        );

        const escapeXml = (value) => String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

        const imageData = (filename) => {

            const file = imagePath(filename);

            if (!file) return null;

            const ext = path.extname(file).toLowerCase();

            let mime = "image/png";

            if (ext === ".jpg" || ext === ".jpeg") {
                mime = "image/jpeg";
            }

            if (ext === ".webp") {
                mime = "image/webp";
            }

            return `data:${mime};base64,${
                fs.readFileSync(file).toString("base64")
            }`;
        };

        const background =
            imageData(settings.background_image);

        const logo =
            imageData(settings.logo);

        const signature =
            imageData(settings.signature_image);

        const width = 1536;
        const height = 1085;

        const certificateDate = settings.event_date
            ? new Date(settings.event_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            })
            : new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${width}"
    height="${height}"
    viewBox="0 0 ${width} ${height}">

    <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fffef9"/>
            <stop offset="100%" stop-color="#fffaf0"/>
        </linearGradient>

        <linearGradient id="saffron" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#f57c00"/>
            <stop offset="100%" stop-color="#ff9d16"/>
        </linearGradient>

        <linearGradient id="green" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#16813b"/>
            <stop offset="100%" stop-color="#2e9b52"/>
        </linearGradient>

        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4"
                flood-color="#777" flood-opacity=".18"/>
        </filter>
    </defs>

    <!-- PAPER -->
    <rect
        x="0"
        y="0"
        width="${width}"
        height="${height}"
        fill="url(#paper)"/>

    <!-- TRICOLOUR BRUSH STROKES — TOP LEFT -->
    <path
        d="M18 42
           C170 0 300 15 470 80
           C350 105 225 145 55 230
           C35 175 25 105 18 42Z"
        fill="url(#saffron)"
        opacity=".96"/>

    <path
        d="M28 135
           C180 82 315 100 480 145
           C350 170 220 225 55 320
           C38 260 30 200 28 135Z"
        fill="#f4f4f4"
        opacity=".96"/>

    <path
        d="M25 225
           C180 175 330 195 500 245
           C360 275 210 340 45 425
           C35 360 28 290 25 225Z"
        fill="url(#green)"
        opacity=".96"/>

    <!-- ASHOKA CHAKRA TOP LEFT -->
    <circle
        cx="165"
        cy="210"
        r="58"
        fill="none"
        stroke="#193b72"
        stroke-width="7"
        opacity=".17"/>

    <circle
        cx="165"
        cy="210"
        r="10"
        fill="#193b72"
        opacity=".17"/>

    ${Array.from({length:24}, (_,i) => {
        const a = (i * 15) * Math.PI / 180;
        const x1 = 165 + Math.cos(a) * 12;
        const y1 = 210 + Math.sin(a) * 12;
        const x2 = 165 + Math.cos(a) * 52;
        const y2 = 210 + Math.sin(a) * 52;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
            stroke="#193b72" stroke-width="2" opacity=".17"/>`;
    }).join("")}

    <!-- TOP RIGHT INDEPENDENCE EMBLEM -->
    <text
        x="1250"
        y="68"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="27"
        font-weight="700"
        fill="#142b64">
        CELEBRATING
    </text>

    <text
        x="1190"
        y="145"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="104"
        font-weight="700"
        fill="#e87500">
        80
    </text>

    <text
        x="1265"
        y="115"
        font-family="Arial, sans-serif"
        font-size="30"
        font-weight="700"
        fill="#187b3b">
        th
    </text>

    <path
        d="M1270 138 C1335 120 1380 120 1430 140"
        fill="none"
        stroke="#e87500"
        stroke-width="7"/>

    <path
        d="M1275 151 C1335 138 1380 140 1428 155"
        fill="none"
        stroke="#187b3b"
        stroke-width="7"/>

    <text
        x="1250"
        y="190"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="35"
        font-weight="700"
        fill="#142b64">
        INDEPENDENCE
    </text>

    <text
        x="1250"
        y="220"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="20"
        font-weight="700"
        fill="#e87500">
        ${escapeXml(settings.independence_years || "1947 - 2027")}
    </text>

    <text
        x="1250"
        y="248"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="18"
        fill="#142b64">
        Azadi ka Amrit Mahotsav
    </text>

    <!-- OUTER FRAME -->
    <rect
        x="18"
        y="18"
        width="${width - 36}"
        height="${height - 36}"
        rx="8"
        fill="none"
        stroke="#b8862d"
        stroke-width="5"/>

    <rect
        x="31"
        y="31"
        width="${width - 62}"
        height="${height - 62}"
        rx="5"
        fill="none"
        stroke="#d3a33a"
        stroke-width="1.5"/>

    <!-- LOGO -->
    ${
        logo
            ? `<image
                href="${logo}"
                x="${width / 2 - 105}"
                y="42"
                width="210"
                height="210"
                preserveAspectRatio="xMidYMid meet"/>`
            : ""
    }

    <!-- ORGANIZATION -->
    <text
        x="${width / 2}"
        y="315"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="27"
        font-weight="700"
        letter-spacing="1"
        fill="#142b64">
        ${escapeXml(settings.organization_name || "ACTIVE RURAL SOCIAL PROGRESS")}
    </text>

    <!-- DECORATIVE DIVIDER -->
    <line
        x1="445"
        y1="420"
        x2="1090"
        y2="420"
        stroke="#c6922d"
        stroke-width="2"/>

    <path
        d="M768 405
           l18 18
           l-18 18
           l-18-18z"
        fill="#c6922d"/>

    <!-- TIRANGA CERTIFICATE IDENTIFICATION -->
    <text
        x="${width / 2}"
        y="370"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="24"
        font-weight="700"
        letter-spacing="3"
        fill="#e87500">
        TIRANGA CERTIFICATE
    </text>

    <!-- PRESENTED TEXT -->
    <text
        x="${width / 2}"
        y="475"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="27"
        font-weight="700"
        fill="#333">
        ${escapeXml(
            settings.presented_text ||
            "THIS CERTIFICATE IS PROUDLY PRESENTED TO"
        )}
    </text>

    <!-- RECIPIENT -->
    <text
        x="${width / 2}"
        y="570"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${String(fullName).length > 25 ? 45 : 58}"
        font-weight="700"
        fill="#142b64">
        ${escapeXml(fullName)}
    </text>

    <line
        x1="260"
        y1="595"
        x2="1276"
        y2="595"
        stroke="#c6922d"
        stroke-width="3"/>

    <!-- PERSONAL DETAILS PANEL -->
    <rect
        x="245"
        y="625"
        width="1046"
        height="190"
        rx="10"
        fill="#fffdf7"
        stroke="#d8b15b"
        stroke-width="1.5"
        filter="url(#softShadow)"/>

    <!-- ROW 1 -->
    <text x="285" y="665"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#142b64">
        Father Name:
    </text>

    <text x="475" y="665"
        font-family="Arial, sans-serif"
        font-size="19"
        fill="#222">
        ${escapeXml(fatherName)}
    </text>

    <text x="825" y="665"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#142b64">
        Mobile:
    </text>

    <text x="955" y="665"
        font-family="Arial, sans-serif"
        font-size="19"
        fill="#222">
        ${escapeXml(normalizedMobile)}
    </text>

    <!-- ROW 2 -->
    <text x="285" y="715"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#142b64">
        Village:
    </text>

    <text x="475" y="715"
        font-family="Arial, sans-serif"
        font-size="19"
        fill="#222">
        ${escapeXml(villageName)}
    </text>

    <text x="825" y="715"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#142b64">
        Post Office:
    </text>

    <text x="1000" y="715"
        font-family="Arial, sans-serif"
        font-size="19"
        fill="#222">
        ${escapeXml(postOffice)}
    </text>

    <!-- ROW 3 -->
    <text x="285" y="765"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#142b64">
        Police Station:
    </text>

    <text x="485" y="765"
        font-family="Arial, sans-serif"
        font-size="19"
        fill="#222">
        ${escapeXml(policeStation)}
    </text>

    <!-- QR -->
    <rect
        x="90"
        y="845"
        width="150"
        height="150"
        rx="6"
        fill="#ffffff"
        stroke="#c6922d"
        stroke-width="2"/>

    <image
        href="${qrData}"
        x="105"
        y="860"
        width="120"
        height="120"
        preserveAspectRatio="xMidYMid meet"/>

    <text
        x="165"
        y="1012"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="12"
        font-weight="700"
        fill="#142b64">
        SCAN TO VERIFY
    </text>

    <!-- DATE -->
    <text
        x="385"
        y="900"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="27"
        font-weight="700"
        fill="#142b64">
        ${escapeXml(certificateDate)}
    </text>

    <line
        x1="230"
        y1="920"
        x2="540"
        y2="920"
        stroke="#c6922d"
        stroke-width="2"/>

    <text
        x="385"
        y="950"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="18"
        font-weight="700"
        fill="#142b64">
        DATE
    </text>

    <!-- SIGNATURE -->
    ${
        signature
            ? `<image
                href="${signature}"
                x="1040"
                y="840"
                width="260"
                height="95"
                preserveAspectRatio="xMidYMid meet"/>`
            : `<text
                x="1170"
                y="900"
                text-anchor="middle"
                font-family="'Brush Script MT', cursive"
                font-size="42"
                fill="#222">
                ${escapeXml(settings.signature_name || "")}
            </text>`
    }

    <line
        x1="1030"
        y1="930"
        x2="1310"
        y2="930"
        stroke="#c6922d"
        stroke-width="2"/>

    <text
        x="1170"
        y="962"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="18"
        font-weight="700"
        fill="#142b64">
        ${escapeXml(settings.signature_designation || "GENERAL SECRETARY")}
    </text>

    <text
        x="1170"
        y="988"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="15"
        fill="#333">
        ${escapeXml(settings.organization_name || "Active Rural Social Progress")}
    </text>

    <!-- CERTIFICATE NUMBER -->
    <text
        x="1450"
        y="1040"
        text-anchor="end"
        font-family="Arial, sans-serif"
        font-size="13"
        fill="#777">
        Certificate No: ${escapeXml(certificateNo)}
    </text>

    <!-- BOTTOM TRICOLOUR -->
    <path
        d="M1120 1085
           C1230 1010 1350 965 1536 900
           L1536 1085Z"
        fill="url(#saffron)"
        opacity=".95"/>

    <path
        d="M1190 1085
           C1310 1025 1420 995 1536 955
           L1536 1085Z"
        fill="#ffffff"
        opacity=".95"/>

    <path
        d="M1260 1085
           C1380 1040 1460 1020 1536 995
           L1536 1085Z"
        fill="url(#green)"
        opacity=".95"/>

</svg>`;

        res.setHeader(
            "Content-Type",
            "image/svg+xml; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `inline; filename="${certificateNo}.svg"`
        );

        res.send(svg);

    } catch (err) {

        console.error(err);

        if (!res.headersSent) {
            res.status(500).send(
                "Unable to generate certificate."
            );
        }

    }

};


// =====================================================
// TIRANGA CERTIFICATE — HIGH QUALITY PDF
// =====================================================
exports.generatePdf = async (req, res) => {
    try {
        const certificateNo = String(
            req.params.certificateNo || ""
        ).trim();

        if (!certificateNo) {
            return res.status(400).send(
                "Certificate number is required."
            );
        }

        const [rows] = await require("../config/database").query(
            `SELECT
                certificate_no,
                full_name,
                father_name,
                village_name,
                post_office,
                police_station,
                mobile,
                issue_date
             FROM tiranga_certificates
             WHERE certificate_no = ?
             LIMIT 1`,
            [certificateNo]
        );

        if (!rows.length) {
            return res.status(404).send(
                "Tiranga Certificate not found."
            );
        }

        const certificate = rows[0];
        const settings =
            await TirangaCertificate.getSettings();

        // Generate the exact same verification QR used by the SVG certificate.
        const scannerBase =
            `${req.protocol}://${req.get("host")}`;

        const verifyUrl =
            `${scannerBase}/arsp/tiranga/verify/${encodeURIComponent(certificateNo)}`;

        const qrData = await QRCode.toDataURL(
            verifyUrl,
            {
                width: 600,
                margin: 2,
                errorCorrectionLevel: "H"
            }
        );

        /*
         * IMPORTANT:
         * The PDF uses the SAME SVG artwork as the image certificate.
         *
         * Therefore:
         *   Image certificate = SVG artwork
         *   PDF certificate   = same SVG artwork converted to PDF
         *
         * This prevents the PDF from having a different layout/design.
         */

        const escapeXml = (value) =>
            String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");

        const imageData = (filename) => {
            const file = imagePath(filename);

            if (!file) return null;

            const ext = path.extname(file).toLowerCase();

            let mime = "image/png";

            if (ext === ".jpg" || ext === ".jpeg") {
                mime = "image/jpeg";
            }

            if (ext === ".webp") {
                mime = "image/webp";
            }

            return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
        };

        const background = imageData(
            settings.background_image
        );

        const logo = imageData(settings.logo);

        const signature = imageData(
            settings.signature_image
        );

        const width = 1536;
        const height = 1085;

        const certificateDate = certificate.issue_date
            ? new Date(
                certificate.issue_date
            ).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            })
            : new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });

        /*
         * This SVG is intentionally kept in the same design structure
         * as the normal certificate generator.
         *
         * The PDF therefore contains:
         * - the same border
         * - same Tiranga decoration
         * - same Ashoka Chakra
         * - same independence emblem
         * - same logo
         * - same organization
         * - TIRANGA CERTIFICATE identification
         * - same recipient
         * - same personal details
         * - same QR
         * - same date
         * - same signature
         * - same certificate number
         */

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${width}"
    height="${height}"
    viewBox="0 0 ${width} ${height}">

    <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fffef9"/>
            <stop offset="100%" stop-color="#fffaf0"/>
        </linearGradient>

        <linearGradient id="saffron" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#f57c00"/>
            <stop offset="100%" stop-color="#ff9d16"/>
        </linearGradient>

        <linearGradient id="green" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#16813b"/>
            <stop offset="100%" stop-color="#2e9b52"/>
        </linearGradient>

        <filter id="softShadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%">
            <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                flood-color="#777"
                flood-opacity=".18"/>
        </filter>
    </defs>

    <!-- PAPER -->
    <rect
        x="0"
        y="0"
        width="${width}"
        height="${height}"
        fill="url(#paper)"/>

    <!-- TOP LEFT TRICOLOUR -->
    <path
        d="M18 42
           C170 0 300 15 470 80
           C350 105 225 145 55 230
           C35 175 25 105 18 42Z"
        fill="url(#saffron)"
        opacity=".96"/>

    <path
        d="M28 135
           C180 82 315 100 480 145
           C350 170 220 225 55 320
           C38 260 30 200 28 135Z"
        fill="#f4f4f4"
        opacity=".96"/>

    <path
        d="M25 225
           C180 175 330 195 500 245
           C360 275 210 340 45 425
           C35 360 28 290 25 225Z"
        fill="url(#green)"
        opacity=".96"/>

    <!-- ASHOKA CHAKRA -->
    <circle
        cx="165"
        cy="210"
        r="58"
        fill="none"
        stroke="#193b72"
        stroke-width="7"
        opacity=".17"/>

    <circle
        cx="165"
        cy="210"
        r="10"
        fill="#193b72"
        opacity=".17"/>

    ${Array.from({length:24}, (_,i) => {
        const a = (i * 15) * Math.PI / 180;
        const x1 = 165 + Math.cos(a) * 12;
        const y1 = 210 + Math.sin(a) * 12;
        const x2 = 165 + Math.cos(a) * 52;
        const y2 = 210 + Math.sin(a) * 52;

        return `<line
            x1="${x1}"
            y1="${y1}"
            x2="${x2}"
            y2="${y2}"
            stroke="#193b72"
            stroke-width="2"
            opacity=".17"/>`;
    }).join("")}

    <!-- TOP RIGHT INDEPENDENCE EMBLEM -->
    <text
        x="1250"
        y="68"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="27"
        font-weight="700"
        fill="#142b64">
        CELEBRATING
    </text>

    <text
        x="1190"
        y="145"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="104"
        font-weight="700"
        fill="#e87500">
        80
    </text>

    <text
        x="1265"
        y="115"
        font-family="Arial, sans-serif"
        font-size="30"
        font-weight="700"
        fill="#187b3b">
        th
    </text>

    <path
        d="M1270 138 C1335 120 1380 120 1430 140"
        fill="none"
        stroke="#e87500"
        stroke-width="7"/>

    <path
        d="M1275 151 C1335 138 1380 140 1428 155"
        fill="none"
        stroke="#187b3b"
        stroke-width="7"/>

    <text
        x="1250"
        y="190"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="35"
        font-weight="700"
        fill="#142b64">
        INDEPENDENCE
    </text>

    <text
        x="1250"
        y="220"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="20"
        font-weight="700"
        fill="#e87500">
        ${escapeXml(settings.independence_years || "1947 - 2027")}
    </text>

    <text
        x="1250"
        y="248"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="18"
        fill="#142b64">
        Azadi ka Amrit Mahotsav
    </text>

    <!-- OUTER FRAME -->
    <rect
        x="18"
        y="18"
        width="${width - 36}"
        height="${height - 36}"
        rx="8"
        fill="none"
        stroke="#b8862d"
        stroke-width="5"/>

    <rect
        x="31"
        y="31"
        width="${width - 62}"
        height="${height - 62}"
        rx="5"
        fill="none"
        stroke="#d3a33a"
        stroke-width="1.5"/>

    <!-- LOGO -->
    ${
        logo
            ? `<image
                href="${logo}"
                x="${width / 2 - 105}"
                y="42"
                width="210"
                height="210"
                preserveAspectRatio="xMidYMid meet"/>`
            : ""
    }

    <!-- ORGANIZATION -->
    <text
        x="${width / 2}"
        y="315"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="27"
        font-weight="700"
        letter-spacing="1"
        fill="#142b64">
        ${escapeXml(
            settings.organization_name ||
            "ACTIVE RURAL SOCIAL PROGRESS"
        )}
    </text>

    <!-- TIRANGA CERTIFICATE -->
    <text
        x="${width / 2}"
        y="370"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="24"
        font-weight="700"
        letter-spacing="3"
        fill="#e87500">
        TIRANGA CERTIFICATE
    </text>

    <!-- DECORATIVE DIVIDER -->
    <line
        x1="445"
        y1="420"
        x2="1090"
        y2="420"
        stroke="#c6922d"
        stroke-width="2"/>

    <path
        d="M768 405
           l18 18
           l-18 18
           l-18-18z"
        fill="#c6922d"/>

    <!-- PRESENTED TEXT -->
    <text
        x="${width / 2}"
        y="475"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="27"
        font-weight="700"
        fill="#333">
        ${escapeXml(
            settings.presented_text ||
            "THIS CERTIFICATE IS PROUDLY PRESENTED TO"
        )}
    </text>

    <!-- RECIPIENT -->
    <text
        x="${width / 2}"
        y="570"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${String(certificate.full_name).length > 25 ? 45 : 58}"
        font-weight="700"
        fill="#142b64">
        ${escapeXml(certificate.full_name)}
    </text>

    <line
        x1="260"
        y1="595"
        x2="1276"
        y2="595"
        stroke="#c6922d"
        stroke-width="3"/>

    <!-- PERSONAL DETAILS -->
    <rect
        x="245"
        y="625"
        width="1046"
        height="190"
        rx="10"
        fill="#fffdf7"
        stroke="#d8b15b"
        stroke-width="1.5"
        filter="url(#softShadow)"/>

    <text x="285" y="665"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#142b64">
        Father Name:
    </text>

    <text x="475" y="665"
        font-family="Arial, sans-serif"
        font-size="19"
        fill="#222">
        ${escapeXml(certificate.father_name)}
    </text>

    <text x="825" y="665"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#142b64">
        Mobile:
    </text>

    <text x="955" y="665"
        font-family="Arial, sans-serif"
        font-size="19"
        fill="#222">
        ${escapeXml(certificate.mobile)}
    </text>

    <text x="285" y="715"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#142b64">
        Village:
    </text>

    <text x="475" y="715"
        font-family="Arial, sans-serif"
        font-size="19"
        fill="#222">
        ${escapeXml(certificate.village_name)}
    </text>

    <text x="825" y="715"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#142b64">
        Post Office:
    </text>

    <text x="1000" y="715"
        font-family="Arial, sans-serif"
        font-size="19"
        fill="#222">
        ${escapeXml(certificate.post_office)}
    </text>

    <text x="285" y="765"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
        fill="#142b64">
        Police Station:
    </text>

    <text x="485" y="765"
        font-family="Arial, sans-serif"
        font-size="19"
        fill="#222">
        ${escapeXml(certificate.police_station)}
    </text>

    <!-- QR -->
    <rect
        x="90"
        y="845"
        width="150"
        height="150"
        rx="6"
        fill="#ffffff"
        stroke="#c6922d"
        stroke-width="2"/>

    <image
        href="${qrData}"
        x="105"
        y="860"
        width="120"
        height="120"
        preserveAspectRatio="xMidYMid meet"/>

    <text
        x="165"
        y="1012"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="12"
        font-weight="700"
        fill="#142b64">
        SCAN TO VERIFY
    </text>

    <!-- DATE -->
    <text
        x="385"
        y="900"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="27"
        font-weight="700"
        fill="#142b64">
        ${escapeXml(certificateDate)}
    </text>

    <line
        x1="230"
        y1="920"
        x2="540"
        y2="920"
        stroke="#c6922d"
        stroke-width="2"/>

    <text
        x="385"
        y="950"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="18"
        font-weight="700"
        fill="#142b64">
        DATE
    </text>

    <!-- SIGNATURE -->
    ${
        signature
            ? `<image
                href="${signature}"
                x="1040"
                y="840"
                width="260"
                height="95"
                preserveAspectRatio="xMidYMid meet"/>`
            : `<text
                x="1170"
                y="900"
                text-anchor="middle"
                font-family="'Brush Script MT', cursive"
                font-size="42"
                fill="#222">
                ${escapeXml(settings.signature_name || "")}
            </text>`
    }

    <line
        x1="1030"
        y1="930"
        x2="1310"
        y2="930"
        stroke="#c6922d"
        stroke-width="2"/>

    <text
        x="1170"
        y="962"
        text-anchor="middle"
        font-family="Georgia, serif"
        font-size="18"
        font-weight="700"
        fill="#142b64">
        ${escapeXml(
            settings.signature_designation ||
            "GENERAL SECRETARY"
        )}
    </text>

    <text
        x="1170"
        y="988"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="15"
        fill="#333">
        ${escapeXml(
            settings.organization_name ||
            "Active Rural Social Progress"
        )}
    </text>

    <!-- CERTIFICATE NUMBER -->
    <text
        x="1450"
        y="1040"
        text-anchor="end"
        font-family="Arial, sans-serif"
        font-size="13"
        fill="#777">
        Certificate No: ${escapeXml(certificateNo)}
    </text>

    <!-- BOTTOM TRICOLOUR -->
    <path
        d="M1120 1085
           C1230 1010 1350 965 1536 900
           L1536 1085Z"
        fill="url(#saffron)"
        opacity=".95"/>

    <path
        d="M1190 1085
           C1310 1025 1420 995 1536 955
           L1536 1085Z"
        fill="#ffffff"
        opacity=".95"/>

    <path
        d="M1260 1085
           C1380 1040 1460 1020 1536 995
           L1536 1085Z"
        fill="url(#green)"
        opacity=".95"/>

</svg>`;

        /*
         * A4 landscape is only the PDF page container.
         * The SVG itself remains 1536 × 1085 and is scaled
         * proportionally to the page.
         */

        const PAGE_W = 841.89;
        const PAGE_H = 595.28;

        const doc = new PDFDocument({
            size: [PAGE_W, PAGE_H],
            margin: 0,
            autoFirstPage: true,
            compress: true
        });

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${certificateNo}.pdf"`
        );

        doc.pipe(res);

        /*
         * Convert the exact SVG certificate artwork
         * directly into the PDF.
         */
        SVGtoPDF(
            doc,
            svg,
            0,
            0,
            {
                width: PAGE_W,
                height: PAGE_H,
                preserveAspectRatio: "xMidYMid meet"
            }
        );

        doc.end();

    } catch (err) {
        console.error(
            "TIRANGA PDF ERROR:",
            err
        );

        if (!res.headersSent) {
            res.status(500).send(
                "Unable to generate Tiranga Certificate PDF."
            );
        }
    }
};;



// =====================================================


exports.adminSettings = async (req, res) => {

    try {

        const settings = await TirangaCertificate.getSettings();

        res.render("admin/tiranga/settings", {
            title: "Tiranga Certificate",
            settings
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Unable to load Tiranga Certificate settings.");
    }
};


exports.updateSettings = async (req, res) => {

    try {

        await TirangaCertificate.updateSettings(req.body);

        res.redirect(
            "/admin/tiranga-certificate?success=1"
        );

    } catch (err) {

        console.error(err);
        res.status(500).send("Unable to update Tiranga Certificate settings.");
    }
};


exports.uploadImage = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).send("No image uploaded.");
        }

        await TirangaCertificate.updateImage(
            req.body.image_field,
            req.file.filename
        );

        res.redirect(
            "/admin/tiranga-certificate?success=1"
        );

    } catch (err) {

        console.error(err);
        res.status(500).send("Unable to upload image.");
    }
};


exports.adminCertificates = async (req, res) => {

    try {

        const certificates =
            await TirangaCertificate.getAllCertificates();

        res.render("admin/tiranga/certificates", {
            title: "Tiranga Certificates",
            certificates
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Unable to load certificates.");
    }
};


exports.adminDashboard = async (req, res) => {
    try {
        const certificates =
            await TirangaCertificate.getAllCertificates();

        const settings =
            await TirangaCertificate.getSettings();

        const stats = {
            total: certificates.length
        };

        res.render("admin/tiranga/dashboard", {
            title: "Tiranga Certificate Dashboard",
            stats,
            certificates,
            settings
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(
            "Unable to load Tiranga Certificate dashboard."
        );
    }
};
