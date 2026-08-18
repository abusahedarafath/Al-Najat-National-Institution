const fs = require("fs");
const path = require("path");

// Android/Termux compatibility
process.env.SHARP_FORCE_WASM = "1";

const sharp = require("sharp");

const UPLOAD_DIR = path.resolve(
    __dirname,
    "../public/uploads/arsp-members"
);

const MAX_BYTES = 1024 * 1024; // 1 MB
const FINAL_WIDTH = 400;
const FINAL_HEIGHT = 500;

function makeOutputName() {
    return (
        Date.now() +
        "-" +
        Math.round(Math.random() * 1000000000) +
        ".jpg"
    );
}

/**
 * Normalize a newly uploaded member photograph.
 *
 * Final format:
 *   JPEG
 *   400 x 500
 *   <= 1 MB
 *
 * IMPORTANT:
 * This function only processes the file supplied in the
 * current request. Existing member files are never touched.
 */
async function processMemberPhoto(file) {
    if (!file || !file.path) {
        return null;
    }

    const inputPath = path.resolve(file.path);

    const outputName = makeOutputName();

    const outputPath = path.resolve(
        UPLOAD_DIR,
        outputName
    );

    // Safety: output must remain inside the member upload directory.
    if (
        !outputPath.startsWith(
            UPLOAD_DIR + path.sep
        )
    ) {
        throw new Error("Invalid member photo output path.");
    }

    let quality = 82;
    let width = FINAL_WIDTH;
    let height = FINAL_HEIGHT;

    try {
        while (true) {
            await sharp(inputPath)
                .rotate()
                .resize(width, height, {
                    fit: "cover",
                    position: "centre"
                })
                .jpeg({
                    quality,
                    mozjpeg: true
                })
                .toFile(outputPath);

            const size = fs.statSync(outputPath).size;

            if (size <= MAX_BYTES) {
                break;
            }

            fs.rmSync(outputPath, {
                force: true
            });

            if (quality > 40) {
                quality -= 5;
                continue;
            }

            if (width > 240) {
                width -= 20;
                height -= 25;
                quality = 55;
                continue;
            }

            throw new Error(
                "Unable to compress member photo below 1 MB."
            );
        }

        /*
         * Delete ONLY the temporary upload created by
         * the current multer request.
         */
        if (
            inputPath !== outputPath &&
            fs.existsSync(inputPath)
        ) {
            fs.rmSync(inputPath, {
                force: true
            });
        }

        return outputName;

    } catch (error) {

        if (fs.existsSync(outputPath)) {
            fs.rmSync(outputPath, {
                force: true
            });
        }

        /*
         * Clean up only the current request's temporary file.
         */
        if (
            fs.existsSync(inputPath) &&
            inputPath !== outputPath
        ) {
            fs.rmSync(inputPath, {
                force: true
            });
        }

        throw error;
    }
}

module.exports = {
    processMemberPhoto
};
