const generateQRCode = require("./utils/qrGenerator");

(async () => {

    try {

        const file = await generateQRCode(

            "TEST0001",

            "http://localhost:3000/arsp/verify/TEST0001"

        );

        console.log("QR Created:", file);

    } catch (err) {

        console.error(err);

    }

})();
