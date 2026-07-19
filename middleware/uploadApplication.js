const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/applications");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

// Allowed file types
const fileFilter = (req, file, cb) => {

    const allowed = /jpg|jpeg|png|pdf/;

    const ext = allowed.test(
        path.extname(file.originalname).toLowerCase()
    );

    if (ext) {
        return cb(null, true);
    }

    cb(new Error("Only JPG, JPEG, PNG and PDF files are allowed."));
};

const upload = multer({

    storage,

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter

});

module.exports = upload;
