const PDFDocument = require("pdfkit");
const path = require("path");

const FeeReceipt = require("../models/FeeReceipt");

// ======================================
// View Receipt
// ======================================

exports.viewReceipt = (req, res) => {

    FeeReceipt.getByPaymentId(req.params.id, (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Internal Server Error");

        }

        if (!result.length) {

            return res.status(404).send("Receipt not found.");

        }

        res.render("admin/fee-receipt", {

            title: "Fee Receipt",
            receipt: result[0]

        });

    });

};

// ======================================
// Download Receipt PDF
// ======================================

exports.downloadReceipt = (req, res) => {

    FeeReceipt.getByPaymentId(req.params.id, (err, result) => {

        if (err) {

            console.error(err);

            return res.status(500).send("Internal Server Error");

        }

        if (!result.length) {

            return res.status(404).send("Receipt not found.");

        }

        const receipt = result[0];

        const doc = new PDFDocument({

            size: "A4",
            margin: 40

        });

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `inline; filename=${receipt.receipt_no}.pdf`
        );

        doc.pipe(res);

        const logoPath = path.join(
            __dirname,
            "../public/images/logo.png"
        );

        try {

            doc.image(
                logoPath,
                40,
                30,
                {
                    width: 60
                }
            );

        } catch (e) {

            // Logo is optional

        }

        doc
            .fontSize(22)
            .text(
                "AL-NAJAT NATIONAL INSTITUTION",
                120,
                40
            );

        doc
            .fontSize(12)
            .text(
                "Official Fee Receipt",
                120,
                70
            );

        doc.moveDown(3);

        doc.fontSize(12);

        doc.text(`Receipt No : ${receipt.receipt_no}`);
        doc.text(`Date : ${new Date(receipt.payment_date).toLocaleDateString()}`);

        doc.moveDown();

        doc.text(`Student : ${receipt.student_name}`);
        doc.text(`Roll No : ${receipt.roll_number}`);
        doc.text(`Father : ${receipt.father_name || "-"}`);
        doc.text(`Class : ${receipt.class_name}`);
        doc.text(`Fee Category : ${receipt.category_name}`);

        doc.moveDown();

        doc.text(`Amount : ₹ ${receipt.amount}`);
        doc.text(`Fine : ₹ ${receipt.fine}`);
        doc.text(`Discount : ₹ ${receipt.discount}`);

        const total =
            Number(receipt.amount) +
            Number(receipt.fine) -
            Number(receipt.discount);

        doc.text(`Total Paid : ₹ ${total}`);

        doc.text(`Payment Method : ${receipt.payment_method}`);

        doc.text(`Status : ${receipt.payment_status}`);

        doc.moveDown(2);

        doc.text(
            "This is a computer-generated receipt.",
            {
                align: "center"
            }
        );

        doc.moveDown();

        doc.text(
            "Authorized Signature",
            {
                align: "right"
            }
        );

        doc.end();

    });

};
