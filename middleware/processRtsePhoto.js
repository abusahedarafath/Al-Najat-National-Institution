const path = require("path");

const {
    processRtsePhoto
} = require("./rtseImageProcessor");

async function processRtsePhotoMiddleware(
    req,
    res,
    next
) {
    try {

        if (req.files?.photo?.[0]) {

            const processedName =
                await processRtsePhoto(
                    req.files.photo[0]
                );

            req.files.photo[0].filename =
                processedName;

            req.files.photo[0].path =
                path.resolve(
                    __dirname,
                    "../public/uploads/rtse",
                    processedName
                );
        }

        next();

    } catch (error) {

        console.error(
            "RTSE Photo Processing Error:",
            error
        );

        return res.status(400).send(
            "Unable to process the candidate photograph. Please select another image."
        );
    }
}

module.exports =
    processRtsePhotoMiddleware;
