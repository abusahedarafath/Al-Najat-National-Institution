"use strict";

const fs = require("fs");

const RtseApplication = require("../models/RtseApplication");
const RtseLoginInformationPdf =
    require("../models/RtseLoginInformationPdf");

const generatePdf =
    require("../utils/rtseLoginInformationPdf").generate;

function getStudentId(req) {
    return Number(req.session?.rtseStudent?.id || 0);
}

async function getApplication(req) {
    const id = getStudentId(req);

    if (!id) {
        return null;
    }

    return RtseApplication.getById(id);
}

exports.status = async (req, res) => {
    try {
        const application = await getApplication(req);

        if (!application) {
            return res.status(401).json({
                success: false,
                prepared: false
            });
        }

        const prepared =
            await RtseLoginInformationPdf.getPrepared(application.id);

        return res.json({
            success: true,
            prepared: Boolean(
                prepared &&
                prepared.file_path &&
                fs.existsSync(prepared.file_path)
            )
        });

    } catch (error) {
        console.error(
            "RTSE login information PDF status error:",
            error
        );

        return res.status(500).json({
            success: false,
            prepared: false
        });
    }
};

exports.prepare = async (req, res) => {
    try {
        const application = await getApplication(req);

        if (!application) {
            return res.status(401).json({
                success: false,
                message: "Student session expired."
            });
        }

        const generated =
            await generatePdf(application);

        const prepared =
            await RtseLoginInformationPdf.savePrepared(
                application.id,
                generated.fileName,
                generated.filePath
            );

        return res.json({
            success: true,
            preparedAt: prepared?.prepared_at || null,
            message: "Login Information PDF prepared successfully."
        });

    } catch (error) {
        console.error(
            "RTSE login information PDF prepare error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to prepare Login Information PDF."
        });
    }
};

exports.view = async (req, res) => {
    try {
        const application = await getApplication(req);

        if (!application) {
            return res.redirect("/rtse/student/login");
        }

        const prepared =
            await RtseLoginInformationPdf.getPrepared(application.id);

        if (
            !prepared ||
            !prepared.file_path ||
            !fs.existsSync(prepared.file_path)
        ) {
            return res.redirect("/rtse/student/dashboard");
        }

        return res.render(
            "rtse/student-login-information-pdf",
            {
                title: "Login Information PDF",
                pdfUrl: "/rtse/student/login-information-pdf/file",
                downloadUrl: "/rtse/student/login-information-pdf/download"
            }
        );

    } catch (error) {
        console.error(
            "RTSE login information PDF view error:",
            error
        );

        return res.status(500).send(
            "Unable to open Login Information PDF."
        );
    }
};

async function streamPdf(req, res, disposition) {
    const application = await getApplication(req);

    if (!application) {
        return res.status(401).send("Unauthorized.");
    }

    const prepared =
        await RtseLoginInformationPdf.getPrepared(application.id);

    if (
        !prepared ||
        !prepared.file_path ||
        !fs.existsSync(prepared.file_path)
    ) {
        return res.status(404).send("PDF is not prepared.");
    }

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        `${disposition}; filename="${prepared.file_name}"`
    );

    return fs.createReadStream(
        prepared.file_path
    ).pipe(res);
}

exports.file = async (req, res) => {
    try {
        return await streamPdf(
            req,
            res,
            "inline"
        );
    } catch (error) {
        console.error(
            "RTSE login information PDF file error:",
            error
        );

        return res.status(500).send(
            "Unable to load PDF."
        );
    }
};

exports.download = async (req, res) => {
    try {
        return await streamPdf(
            req,
            res,
            "attachment"
        );
    } catch (error) {
        console.error(
            "RTSE login information PDF download error:",
            error
        );

        return res.status(500).send(
            "Unable to download PDF."
        );
    }
};

exports.reset = async (req, res) => {
    try {
        const application = await getApplication(req);

        if (!application) {
            return res.status(401).json({
                success: false,
                message: "Student session expired."
            });
        }

        const prepared =
            await RtseLoginInformationPdf.reset(
                application.id
            );

        if (
            prepared &&
            prepared.file_path &&
            fs.existsSync(prepared.file_path)
        ) {
            fs.unlinkSync(prepared.file_path);
        }

        return res.json({
            success: true,
            message: "Login Information PDF reset successfully."
        });

    } catch (error) {
        console.error(
            "RTSE login information PDF reset error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to reset Login Information PDF."
        });
    }
};
