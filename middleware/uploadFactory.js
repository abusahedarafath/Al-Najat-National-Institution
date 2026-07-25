const multer = require("multer");
const path = require("path");
const fs = require("fs");

function createUploader(folder) {

    const storage = multer.diskStorage({

        destination: (req, file, cb) => {

            const uploadPath = path.join(
                __dirname,
                "../public/uploads",
                folder
            );

            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);

        },

        filename: (req, file, cb) => {

            const fileName =
                Date.now() +
                "-" +
                Math.round(Math.random() * 1000000000) +
                path.extname(file.originalname);

            cb(null, fileName);

        }

    });

    const fileFilter = (req, file, cb) => {

        const allowedExt = /\.(jpg|jpeg|png|webp|pdf)$/i;

        const allowedMime = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
        ];

        const ext = allowedExt.test(file.originalname);

        const mime = allowedMime.includes(file.mimetype);

        if (ext && mime) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, JPG, JPEG, PNG and WEBP files are allowed."));
        }

    };

    return multer({
        storage,
        fileFilter
    });

}

module.exports = createUploader;
