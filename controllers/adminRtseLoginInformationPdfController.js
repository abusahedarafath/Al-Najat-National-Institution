"use strict";

const fs = require("fs");
const db = require("../config/database");
const RtseSetting = require("../models/RtseSetting");
const RtseLoginInformationPdf =
    require("../models/RtseLoginInformationPdf");

const generateSectionPdf =
    require("../utils/rtseLoginInformationPdf").generateSection;

const ALLOWED_SECTIONS = [
    "A",
    "B",
    "C",
    "D",
    "E"
];

async function getSectionApplications(section) {

    const setting =
        await RtseSetting.get();

    const applicationYear =
        Number(setting?.exam_year);

    if (!applicationYear) {
        const error = new Error(
            "RTSE examination year is not configured."
        );

        error.statusCode = 400;

        throw error;
    }

    const [applications] =
        await db.query(
            `SELECT *
             FROM rtse_applications
             WHERE archive = 0
               AND application_year = ?
               AND UPPER(section) = ?
             ORDER BY LOWER(full_name) ASC, id ASC`,
            [
                applicationYear,
                section
            ]
        );

    return {
        applicationYear,
        applications
    };
}

function getSectionFilePath(section) {

    const safeSection =
        String(section)
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9_-]/g, "_");

    return require("path").join(
        __dirname,
        "..",
        "storage",
        "rtse-login-information-pdf",
        `rtse-login-information-section-${safeSection}.pdf`
    );
}

async function getSectionPrepared(section) {

    const filePath =
        getSectionFilePath(section);

    return {
        prepared:
            fs.existsSync(filePath),
        filePath,
        fileName:
            require("path").basename(filePath)
    };
}

exports.statusSection = async (req, res) => {

    const section =
        String(req.params.section || "")
            .trim()
            .toUpperCase();

    if (!ALLOWED_SECTIONS.includes(section)) {
        return res.status(400).json({
            success: false,
            message: "Invalid RTSE section."
        });
    }

    try {

        const {
            applicationYear,
            applications
        } = await getSectionApplications(section);

        const prepared =
            await getSectionPrepared(section);

        return res.json({
            success: true,
            section,
            applicationYear,
            totalCount: applications.length,
            prepared: prepared.prepared,
            preparedCount:
                prepared.prepared
                    ? applications.length
                    : 0
        });

    } catch (error) {

        console.error(
            "RTSE admin login information PDF status error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Unable to check Login Information PDF status."
        });
    }
};

exports.prepareSection = async (req, res) => {

    const section =
        String(req.params.section || "")
            .trim()
            .toUpperCase();

    if (!ALLOWED_SECTIONS.includes(section)) {
        return res.status(400).json({
            success: false,
            message: "Invalid RTSE section."
        });
    }

    try {

        const {
            applicationYear,
            applications
        } = await getSectionApplications(section);

        if (!applications.length) {
            return res.status(404).json({
                success: false,
                message:
                    `No RTSE applications found for Section ${section}.`
            });
        }

        /*
         * ONE PDF FOR THE ENTIRE SECTION.
         *
         * No application records are modified.
         * No uploaded files are modified.
         * Roll numbers and admit cards are untouched.
         */
        const generated =
            await generateSectionPdf(
                applications,
                section
            );

        return res.json({
            success: true,
            section,
            applicationYear,
            preparedCount: 1,
            studentCount: applications.length,
            prepared: true,
            fileName: generated.fileName,
            message:
                `Login Information PDF prepared successfully for Section ${section}.`
        });

    } catch (error) {

        console.error(
            "RTSE admin login information PDF preparation error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Unable to prepare Login Information PDF."
        });
    }
};

exports.viewSection = async (req, res) => {

    const section =
        String(req.params.section || "")
            .trim()
            .toUpperCase();

    if (!ALLOWED_SECTIONS.includes(section)) {
        return res.status(400).send(
            "Invalid RTSE section."
        );
    }

    try {

        const prepared =
            await getSectionPrepared(section);

        if (!prepared.prepared) {
            return res.redirect(
                "/admin/rtse/dashboard"
            );
        }

        return res.redirect(
            `/admin/rtse/login-information-pdf/file/${encodeURIComponent(section)}`
        );

    } catch (error) {

        console.error(
            "RTSE admin login information PDF view error:",
            error
        );

        return res.status(500).send(
            "Unable to open Login Information PDF."
        );
    }
};

exports.file = async (req, res) => {

    const section =
        String(req.params.id || "")
            .trim()
            .toUpperCase();

    if (!ALLOWED_SECTIONS.includes(section)) {
        return res.status(400).send(
            "Invalid RTSE section."
        );
    }

    try {

        const prepared =
            await getSectionPrepared(section);

        if (
            !prepared.prepared ||
            !prepared.filePath
        ) {
            return res.status(404).send(
                "Login Information PDF is not prepared."
            );
        }

        const disposition =
            req.query.download === "1"
                ? "attachment"
                : "inline";

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `${disposition}; filename="${prepared.fileName}"`
        );

        return fs
            .createReadStream(prepared.filePath)
            .pipe(res);

    } catch (error) {

        console.error(
            "RTSE admin login information PDF file error:",
            error
        );

        return res.status(500).send(
            "Unable to load Login Information PDF."
        );
    }
};

exports.resetSection = async (req, res) => {

    const section =
        String(req.params.section || "")
            .trim()
            .toUpperCase();

    if (!ALLOWED_SECTIONS.includes(section)) {
        return res.status(400).json({
            success: false,
            message: "Invalid RTSE section."
        });
    }

    try {

        /*
         * Reset ONLY the consolidated Section PDF.
         *
         * No rtse_applications rows are deleted or changed.
         * No uploaded files are touched.
         * Roll numbers and admit cards are untouched.
         */
        const prepared =
            await getSectionPrepared(section);

        if (
            prepared.filePath &&
            fs.existsSync(prepared.filePath)
        ) {
            fs.unlinkSync(prepared.filePath);
        }

        return res.json({
            success: true,
            section,
            resetCount:
                prepared.prepared ? 1 : 0,
            message:
                `Login Information PDF reset successfully for Section ${section}.`
        });

    } catch (error) {

        console.error(
            "RTSE admin login information PDF reset error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to reset Login Information PDF."
        });
    }
};
