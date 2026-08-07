const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const RtseApplication = require("../models/RtseApplication");

class RtseExcel {

    // =====================================
    // Export All Applications
    // =====================================

    static async exportAll(req, res) {

        const students =
            await RtseApplication.getAll();

        return this.buildExcel(

            students,

            "RTSE-All-Applications.xlsx",

            res

        );

    }

    // =====================================
    // Export Section Wise
    // =====================================

    static async exportSection(req, res, section) {

        const students =
            await RtseApplication.getSectionStudents(section);

        return this.buildExcel(

            students,

            `RTSE-Section-${section}.xlsx`,

            res

        );

    }

    // =====================================
    // Build Excel
    // =====================================

    static async buildExcel(students, fileName, res) {

        const workbook =
            new ExcelJS.Workbook();

        const sheet =
            workbook.addWorksheet("RTSE");

        sheet.columns = [

            {
                header:"Photo",
                key:"photo",
                width:18
            },

            {
                header:"Registration No.",
                key:"registration_no",
                width:20
            },

            {
                header:"Roll No.",
                key:"roll_no",
                width:18
            },

            {
                header:"Student Name",
                key:"full_name",
                width:30
            },

            {
                header:"Father's Name",
                key:"father_name",
                width:30
            },

            {
                header:"School Name",
                key:"school_name",
                width:35
            },

            {
                header:"Class",
                key:"class",
                width:10
            },

            {
                header:"Section",
                key:"section",
                width:10
            },

            {
                header:"District",
                key:"district",
                width:20
            },

            {
                header:"Mobile",
                key:"mobile",
                width:18
            },

            {
                header:"Status",
                key:"status",
                width:15
            }

        ];

        sheet.getRow(1).font = {

            bold:true,

            size:12

        };

        let rowNumber = 2;

        for(const student of students){

            sheet.addRow({

                registration_no:
                    student.registration_no,

                roll_no:
                    student.roll_no || "",

                full_name:
                    student.full_name,

                father_name:
                    student.father_name,

                school_name:
                    student.school_name,

                class:
                    student.class,

                section:
                    student.section,

                district:
                    student.district,

                mobile:
                    student.mobile,

                status:
                    student.status

            });

            if(student.photo){

                const imagePath = path.join(

                    __dirname,

                    "..",

                    "public",

                    "uploads",

                    "rtse",

                    student.photo

                );

                if(fs.existsSync(imagePath)){

                    const imageId =
                        workbook.addImage({

                            filename:imagePath,

                            extension:path.extname(imagePath)
                                .replace(".","")

                        });

                    sheet.addImage(

                        imageId,

                        `A${rowNumber}:A${rowNumber}`

                    );

                    sheet.getRow(rowNumber).height = 55;

                }

            }

            rowNumber++;

        }

        res.setHeader(

            "Content-Type",

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        );

        res.setHeader(

            "Content-Disposition",

            `attachment; filename=${fileName}`

        );

        await workbook.xlsx.write(res);

        res.end();

    }

}

module.exports = RtseExcel;
