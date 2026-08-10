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

    static async exportApproved(req, res) {
        const students = (await RtseApplication.getAll())
            .filter(student => student.status === "Approved");

        return this.buildExcel(
            students,
            "RTSE-Approved-Students.xlsx",
            res
        );
    }

    // =====================================
    // Export Section Wise
    // =====================================
    static async exportSection(req, res, section) {

        const students =
            await RtseApplication.getApprovedSectionStudents(section);

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
                header: "Photo",
                key: "photo",
                width: 18
            },

            {
                header: "Registration No.",
                key: "registration_no",
                width: 20
            },

            {
                header: "Roll",
                key: "roll",
                width: 15
            },

            {
                header: "Number",
                key: "roll_number",
                width: 12
            },

            {
                header: "Full Roll No.",
                key: "full_roll_no",
                width: 20
            },

            {
                header: "Student Name",
                key: "full_name",
                width: 30
            },

            {
                header: "Father's Name",
                key: "father_name",
                width: 30
            },
                                                              {
                header: "Date of Birth",
                key: "dob",
                width: 16
            },
                                                              {
                header: "Gender",
                key: "gender",
                width: 12
            },

            {
                header: "School Name",
                key: "school_name",
                width: 35
            },

            {
                header: "Class",
                key: "class",
                width: 10
            },

            {
                header: "Section",
                key: "section",
                width: 10
            },

            {
                header: "District",
                key: "district",
                width: 20
            },

            {
                header: "Mobile",
                key: "mobile",
                width: 18
            },

            {
                header: "Status",
                key: "status",
                width: 15
            },

            {
                header: "Admit Generated",
                key: "admit_generated",
                width: 18
            }

        ];


        sheet.getRow(1).font = {
            bold: true,
            size: 12
        };


        let rowNumber = 2;


        for(const student of students){

            let commonRoll = "";
            let fullRoll = "";

            if(student.roll_no){

                const parts =
                    String(student.roll_no).split("-");

                if(parts.length >= 2){

                    commonRoll =
                        parts[0];

                    fullRoll =
                        student.roll_no;

                } else {

                    commonRoll =
                        student.roll_no;

                    fullRoll =
                        student.roll_no;

                }

            }


            sheet.addRow({

                registration_no:
                    student.registration_no,

                roll:
                    commonRoll,

                roll_number:
                    student.roll_number || "",

                full_roll_no:
                    fullRoll,

                full_name:
                    student.full_name,

                father_name:
                    student.father_name,

                
                dob: student.dob,
                gender: student.gender,
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
                    student.status,

                admit_generated:
                    Number(student.admit_generated || 0) === 1
                        ? "Yes"
                        : "No"

            });


            if(student.photo){

                const imagePath =
                    path.join(
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

                            filename:
                                imagePath,

                            extension:
                                path.extname(imagePath)
                                    .replace(".","")

                        });


                    sheet.addImage(
                        imageId,
                        `A${rowNumber}:A${rowNumber}`
                    );


                    sheet.getRow(rowNumber)
                        .height = 55;

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
            `attachment; filename="${fileName}"`
        );


        await workbook.xlsx.write(res);

        res.end();

    }

}


module.exports = RtseExcel;
