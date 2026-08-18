const {
    processMemberPhoto
} = require("./arspMemberImageProcessor");

async function processArspMemberPhoto(req, res, next) {
    try {

        // Public/admin multi-field upload
        if (req.files?.photo?.[0]) {

            const processedName =
                await processMemberPhoto(
                    req.files.photo[0]
                );

            req.files.photo[0].filename =
                processedName;

            req.files.photo[0].path =
                require("path").resolve(
                    __dirname,
                    "../public/uploads/arsp-members",
                    processedName
                );
        }

        // Single photo upload (admin edit)
        if (req.file) {

            const processedName =
                await processMemberPhoto(
                    req.file
                );

            req.file.filename =
                processedName;

            req.file.path =
                require("path").resolve(
                    __dirname,
                    "../public/uploads/arsp-members",
                    processedName
                );
        }

        next();

    } catch (error) {

        console.error(
            "ARSP Member Photo Processing Error:",
            error
        );

        return res.status(400).send(
            "Unable to process the member photograph. Please select another image."
        );
    }
}

module.exports = processArspMemberPhoto;
