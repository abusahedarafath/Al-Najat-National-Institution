const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

async function generateCertificateQR(filename, url) {

    const folder = path.join(
        __dirname,
        "..",
        "uploads",
        "rtse-certificates"
    );

    if (!fs.existsSync(folder)) {

        fs.mkdirSync(folder, {
            recursive: true
        });

    }

    const filePath = path.join(
        folder,
        filename + ".png"
    );

    await QRCode.toFile(

        filePath,

        url,

        {

            width: 500,

            margin: 2,

            color: {

                dark: "#000000",

                light: "#FFFFFF"

            }

        }

    );

    return filename + ".png";

}

module.exports = generateCertificateQR;
