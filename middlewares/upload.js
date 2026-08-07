const multer = require("multer");
const path = require("path");
const fs = require("fs");

function createUploader(folder) {

    const uploadDir = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        folder
    );

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({

        destination(req, file, cb) {
            cb(null, uploadDir);
        },

        filename(req, file, cb) {

            const ext = path.extname(file.originalname);

            cb(
                null,
                Date.now() + "-" + Math.round(Math.random() * 1E9) + ext
            );

        }

    });

    return multer({

        storage,

        limits: {
            fileSize: 5 * 1024 * 1024
        },

        fileFilter(req, file, cb) {

            if (file.mimetype.startsWith("image/")) {

                cb(null, true);

            } else {

                cb(new Error("Only image files are allowed."));

            }

        }

    });

}

module.exports = createUploader;
