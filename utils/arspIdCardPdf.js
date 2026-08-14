const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = async function generateIdCard(
    member,
    arspSettings,
    cardSettings,
    res
){

    const doc = new PDFDocument({

        size:"A4",

        margin:0

    });

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${member.member_id}.pdf`
    );

    doc.pipe(res);

    const layout={

        pageWidth:595.28,

        pageHeight:841.89,

        cardX:40,

        cardY:190,

        cardWidth:Number(
            cardSettings?.card_width || 515
        ),

        cardHeight:Number(
            cardSettings?.card_height || 325
        ),

        radius:18,

        headerHeight:54,
        footerHeight:55

    };




    drawBackground(
        doc,
        cardSettings,
        layout
    );

    drawHeader(
        doc,
        arspSettings,
        layout
    );

    drawPhoto(
        doc,
        member,
        layout
    );

    drawMemberInfo(
        doc,
        member,
        layout
    );

    drawFooter(
        doc,
        member,
        arspSettings,
        cardSettings,
        layout
    );

    doc.end();

};








// =====================================
// Background
// =====================================

function drawBackground(
    doc,
    cardSettings,
    layout
){

    const background =
        cardSettings &&
        cardSettings.background
            ? path.join(
                __dirname,
                "..",
                "public",
                "uploads",
                "id-card",
                cardSettings.background
            )
            : null;

    // ===============================
    // A4 Paper
    // ===============================

    doc
        .rect(
            0,
            0,
            layout.pageWidth,
            layout.pageHeight
        )
        .fill("#F2F5F8");

    // ===============================
    // Shadow
    // ===============================

    doc
        .save()
        .fillOpacity(0.12)
        .roundedRect(
            layout.cardX + 6,
            layout.cardY + 6,
            layout.cardWidth,
            layout.cardHeight,
            layout.radius
        )
        .fill("#888888")
        .restore();

    // ===============================
    // Main White Card
    // ===============================

    doc
        .roundedRect(
            layout.cardX,
            layout.cardY,
            layout.cardWidth,
            layout.cardHeight,
            layout.radius
        )
        .fill("#FFFFFF");

    // ===============================
    // Background Watermark
    // (BODY ONLY)
    // ===============================

    if (background && fs.existsSync(background)) {

        const bodyY =
            layout.cardY +
            layout.headerHeight +
            3;

        const bodyHeight =
            layout.cardHeight -
            layout.headerHeight -
            layout.footerHeight -
            3;

        doc.save();

        // Only paint inside body
        doc.rect(
            layout.cardX + 2,
            bodyY,
            layout.cardWidth - 4,
            bodyHeight
        ).clip();

        // Draw watermark centered
        const watermarkWidth =
            layout.cardWidth * 0.45;

        const watermarkHeight =
            watermarkWidth;

        const wmX =
            layout.cardX +
            (layout.cardWidth - watermarkWidth) / 2;

        const wmY =
            bodyY +
            (bodyHeight - watermarkHeight) / 2;

        doc.opacity(0.10);

        doc.image(
            background,
            wmX,
            wmY,
            {
                width: watermarkWidth,
                height: watermarkHeight
            }
        );

        doc.restore();

    }

    // ===============================
    // Gold Border
    // ===============================

    doc
        .lineWidth(2)
        .roundedRect(
            layout.cardX + 3,
            layout.cardY + 3,
            layout.cardWidth - 6,
            layout.cardHeight - 6,
            layout.radius - 3
        )
        .stroke("#D4A62A");

}





// =====================================
// Header
// =====================================

function drawHeader(doc, arspSettings, layout){

    const logo =
        arspSettings && arspSettings.logo
            ? path.join(
                __dirname,
                "..",
                "public",
                "uploads",
                "arsp-settings",
                arspSettings.logo
            )
            : null;

    // Header Height
    const headerHeight = 54;

    // Header Background
    doc
        .roundedRect(
            layout.cardX,
            layout.cardY,
            layout.cardWidth,
            headerHeight,
            layout.radius
        )
        .fill("#123B6D");

    // Square Bottom
    doc
        .rect(
            layout.cardX,
            layout.cardY + 28,
            layout.cardWidth,
            26
        )
        .fill("#123B6D");

    // Gold Border
    doc
        .rect(
            layout.cardX,
            layout.cardY + headerHeight,
            layout.cardWidth,
            3
        )
        .fill("#D4A62A");

    // Logo
    if (logo && fs.existsSync(logo)) {

        doc.save();

        doc.circle(
            layout.cardX + 35,
            layout.cardY + 27,
            20
        ).clip();

        doc.image(
            logo,
            layout.cardX + 15,
            layout.cardY + 7,
            {
                width:40,
                height:40
            }
        );

        doc.restore();

        doc.circle(
            layout.cardX + 35,
            layout.cardY + 27,
            20
        )
        .lineWidth(2)
        .stroke("#FFFFFF");
    }

    // Organization Name
    doc
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(18)
        .text(
            arspSettings.organization_name ||
            "ACTIVE RURAL SOCIAL PROGRESS",
            layout.cardX + 70,
            layout.cardY + 10
        );

    // Subtitle
    doc
        .fillColor("#EAEAEA")
        .font("Helvetica")
        .fontSize(8)
        .text(
            "OFFICIAL MEMBER IDENTITY CARD",
            layout.cardX + 72,
            layout.cardY + 30
        );

} 



// =====================================
// Member Photo
// =====================================

function drawPhoto(
    doc,
    member,
    layout
){

    const photo =
        member &&
        member.photo
            ? path.join(
                __dirname,
                "..",
                "public",
                "uploads",
                "arsp-members",
                member.photo
            )
            : null;

    const photoX = layout.cardX + 25;

    const photoY = layout.cardY + layout.headerHeight + 18;

    const photoWidth = 120;

    const photoHeight = 145;

    // Photo Frame

    doc

        .roundedRect(

            photoX,

            photoY,

            photoWidth,

            photoHeight,

            8

        )

        .lineWidth(2)

        .stroke("#123B6D");

    if(

        photo &&

        fs.existsSync(photo)

    ){

        doc.image(

            photo,

            photoX + 5,

            photoY + 5,

            {

                fit:[110,135],

                align:"center",

                valign:"center"

            }

        );

    }else{

        doc

            .fillColor("#999999")

            .font("Helvetica-Bold")

            .fontSize(16)

            .text(

                "PHOTO",

                photoX + 25,

                photoY + 58

            );

    }

}



// =====================================
// Member Information
// =====================================

function drawMemberInfo(
    doc,
    member,
    layout
){

    const infoX = layout.cardX + 180;

    const nameY = layout.cardY + layout.headerHeight + 18;

    // Member Name

    doc

        .fillColor("#123B6D")

        .font("Helvetica-Bold")

        .fontSize(22)

        .text(

            member.full_name || "-",

            infoX,

            nameY,

            {

                width: layout.cardWidth - 205

            }

        );

    // Designation Badge

    const badgeY = nameY + 40;

    doc

        .roundedRect(

            infoX,

            badgeY,

            210,

            28,

            14

        )

        .fill("#D4A62A");

    doc

        .fillColor("#123B6D")

        .font("Helvetica-Bold")

        .fontSize(11)

        .text(

            member.designation || "ARSP MEMBER",

            infoX,

            badgeY + 8,

            {

                width:210,

                align:"center"

            }

        );

    // Details

    let y = badgeY + 45;

    function row(label,value){

        doc

            .fillColor("#123B6D")

            .font("Helvetica-Bold")

            .fontSize(10)

            .text(

                label,

                infoX,

                y

            );

        doc

            .fillColor("#333333")

            .font("Helvetica")

            .text(

                value || "-",

                infoX + 105,

                y

            );

        y += 20;

    }

    row("Member ID",member.member_id);

    row("Committee",member.committee);

    row("Section",member.section);

    row("Status",member.status);

    row("District",member.district);

}


// =====================================
// Footer
// =====================================

function drawFooter(
    doc,
    member,
    arspSettings,
    cardSettings,
    layout
){

    const footerY =
        layout.cardY +
        layout.cardHeight -
        layout.footerHeight;

    const qr =
        member && member.qr_code
            ? path.resolve(
                __dirname,
                "..",
                "uploads",
                "arsp-qr",
                member.qr_code
            )
            : null;

    const signature =
        arspSettings &&
        arspSettings.president_signature
            ? path.join(
                __dirname,
                "..",
                "public",
                "uploads",
                "arsp-settings",
                arspSettings.president_signature
            )
            : null;

    const seal =
        arspSettings &&
        arspSettings.official_seal
            ? path.join(
                __dirname,
                "..",
                "public",
                "uploads",
                "arsp-settings",
                arspSettings.official_seal
            )
            : null;

    // Gold Line

    doc

        .rect(

            layout.cardX,

            footerY - 3,

            layout.cardWidth,

            3

        )

        .fill("#D4A62A");

    // Footer

    doc

        .roundedRect(

            layout.cardX,

            footerY,

            layout.cardWidth,

            layout.footerHeight,

            layout.radius

        )

        .fill("#123B6D");

    doc

        .rect(

            layout.cardX,

            footerY,

            layout.cardWidth,

            18

        )

        .fill("#123B6D");

    // QR

    if(

        cardSettings &&
        cardSettings.qr_enabled === "Yes" &&
        qr &&
        fs.existsSync(qr)

    ){

        doc.image(

            qr,

            layout.cardX + 18,

            footerY + 5,

            {

                width:50,
                height:50

            }

        );

    }

    // Website

    doc

        .fillColor("#FFFFFF")

        .font("Helvetica")

        .fontSize(8)

        .text(

            arspSettings.website || "",

            layout.cardX + 150,

            footerY + 23,

            {

                width:180,

                align:"center"

            }

        );

    // Signature

    if(

        signature &&
        fs.existsSync(signature)

    ){

        doc.image(

            signature,

            layout.cardX +
            layout.cardWidth -
            135,

            footerY + 4,

            {

                fit:[85,35]

            }

        );

    }

    doc

        .fillColor("#FFFFFF")

        .font("Helvetica")

        .fontSize(7)

        .text(

            "Authorized Signature",

            layout.cardX +
            layout.cardWidth -
            145,

            footerY + 40,

            {

                width:100,

                align:"center"

            }

        );

    // Seal

    if(

        seal &&
        fs.existsSync(seal)

    ){

        doc.save();

        doc.circle(

            layout.cardX +
            layout.cardWidth -
            25,

            footerY + 25,

            18

        ).clip();

        doc.image(

            seal,

            layout.cardX +
            layout.cardWidth -
            43,

            footerY + 7,

            {

                width:36,

                height:36

            }

        );

        doc.restore();

    }

}
