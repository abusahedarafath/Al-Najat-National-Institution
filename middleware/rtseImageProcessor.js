const fs = require("fs");
const path = require("path");

process.env.SHARP_FORCE_WASM = "1";

const sharp = require("sharp");

const UPLOAD_DIR = path.resolve(
    __dirname,
    "../public/uploads/rtse"
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
 * Process ONLY the newly uploaded RTSE photograph
 * from the current Multer request.
 *
 * Final:
 *   JPEG
 *   400 x 500
 *   <= 1 MB
 *
 * Existing RTSE uploads are never scanned or modified.
 */
async function processRtsePhoto(file) {
    if (!file || !file.path) {
        return null;
    }

    const inputPath = path.resolve(file.path);
    const outputName = makeOutputName();
    const outputPath = path.resolve(
        UPLOAD_DIR,
        outputName
    );

    if (
        !outputPath.startsWith(
            UPLOAD_DIR + path.sep
        )
    ) {
        throw new Error(
            "Invalid RTSE photo output path."
        );
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

            const size =
                fs.statSync(outputPath).size;

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
                "Unable to compress RTSE photo below 1 MB."
            );
        }

        /*
         * Delete ONLY the temporary/current-request
         * source file created by Multer.
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
         * Cleanup only the current request's file.
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
    processRtsePhoto
};
