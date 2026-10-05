const fs = require("fs");
const path = require("path");

const RtseCertificateSetting =
    require("../models/RtseCertificateSetting");

const RtseCertificateCategorySetting =
    require("../models/RtseCertificateCategorySetting");

const CERTIFICATE_SETTINGS_UPLOAD_DIR = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    "rtse-certificate-settings"
);

function getUploadedFile(files, fieldName) {
    const fileList = files?.[fieldName];

    if (!Array.isArray(fileList) || !fileList[0]) {
        return null;
    }

    return fileList[0];
}

function createUniqueFilename(originalName, mimetype) {
    const extensionMap = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    };

    const extension =
        extensionMap[mimetype] ||
        path.extname(originalName || "").toLowerCase() ||
        ".png";

    return (
        "rtse-certificate-signature-" +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1000000000) +
        extension
    );
}

async function saveSignature(file) {
    if (!file || !file.buffer) {
        return null;
    }

    fs.mkdirSync(CERTIFICATE_SETTINGS_UPLOAD_DIR, {
        recursive: true
    });

    const filename = createUniqueFilename(
        file.originalname,
        file.mimetype
    );

    const outputPath = path.join(
        CERTIFICATE_SETTINGS_UPLOAD_DIR,
        filename
    );

    await fs.promises.writeFile(
        outputPath,
        file.buffer
    );

    return filename;
}

function normalizeText(value) {
    return String(value || "").trim();
}

const CATEGORY_KEYS = [
    "rank1",
    "rank2",
    "rank3",
    "merit",
    "appreciation"
];

exports.page = async (req, res) => {
    try {
        const setting =
            await RtseCertificateSetting.get();

        const categoryRows =
            await RtseCertificateCategorySetting.getAll();

        const categories = {};

        for (const row of categoryRows) {
            categories[row.category_key] = row;
        }

        return res.render(
            "admin/rtse/certificate-settings",
            {
                title: "RTSE Certificate Settings",
                setting,
                categories
            }
        );
    } catch (err) {
        console.error(
            "RTSE certificate settings load error:",
            err
        );

        req.flash(
            "error",
            "Unable to load RTSE Certificate Settings."
        );

        return res.redirect("/admin/rtse");
    }
};

exports.update = async (req, res) => {
    try {
        const current =
            await RtseCertificateSetting.get();

        let leftSignature =
            current?.left_signature || null;

        let rightSignature =
            current?.right_signature || null;

        const leftFile =
            getUploadedFile(
                req.files,
                "left_signature"
            );

        const rightFile =
            getUploadedFile(
                req.files,
                "right_signature"
            );

        const newLeftSignature =
            await saveSignature(leftFile);

        const newRightSignature =
            await saveSignature(rightFile);

        if (newLeftSignature) {
            leftSignature = newLeftSignature;
        }

        if (newRightSignature) {
            rightSignature = newRightSignature;
        }

        await RtseCertificateSetting.update({
            exam_name: normalizeText(
                req.body.exam_name
            ),
            organized_by: normalizeText(
                req.body.organized_by
            ),
            organized_by_label: normalizeText(
                req.body.organized_by_label
            ) || "Organized by",
            left_signature: leftSignature,
            left_signature_label: normalizeText(
                req.body.left_signature_label
            ),
            right_signature: rightSignature,
            right_signature_label: normalizeText(
                req.body.right_signature_label
            )
        });

        for (const categoryKey of CATEGORY_KEYS) {
            await RtseCertificateCategorySetting.update(
                categoryKey,
                normalizeText(
                    req.body[
                        `certificate_name_${categoryKey}`
                    ]
                ),
                normalizeText(
                    req.body[
                        `certificate_description_${categoryKey}`
                    ]
                )
            );
        }

        req.flash(
            "success",
            "RTSE Certificate Settings updated successfully."
        );

        return res.redirect(
            "/admin/rtse/certificate-settings"
        );
    } catch (err) {
        console.error(
            "RTSE certificate settings update error:",
            err
        );

        req.flash(
            "error",
            err.message ||
                "Unable to update RTSE Certificate Settings."
        );

        return res.redirect(
            "/admin/rtse/certificate-settings"
        );
    }
};
