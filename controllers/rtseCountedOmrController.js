const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const RtseApplication = require("../models/RtseApplication");
const RtseExamAttendance = require("../models/RtseExamAttendance");
const RtseCountedOmr = require("../models/RtseCountedOmr");

const STORAGE_DIR = path.join(
    process.cwd(),
    "uploads",
    "rtse-counted-omr"
);

function ensureStorageDirectory() {
    fs.mkdirSync(STORAGE_DIR, {
        recursive: true
    });
}

function isEligibleStudent(student) {
    return (
        student &&
        Number(student.archive) === 0 &&
        student.status === "Approved" &&
        Number(student.admit_generated) === 1 &&
        !!student.roll_no
    );
}

async function getEligiblePresentStudent(applicationId) {
    const student = await RtseApplication.getById(applicationId);

    if (!isEligibleStudent(student)) {
        return null;
    }

    const attendance =
        await RtseExamAttendance.getByApplication(applicationId);

    if (
        !attendance ||
        attendance.attendance_status !== "PRESENT"
    ) {
        return null;
    }

    return student;
}

const controller = {

    // =====================================
    // Upload Counted OMR
    // =====================================
    async upload(req, res) {
        try {
            const applicationId = Number(
                req.params.id
            );

            if (
                !Number.isInteger(applicationId) ||
                applicationId < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid student ID."
                });
            }

            if (!req.file || !req.file.buffer) {
                return res.status(400).json({
                    success: false,
                    message: "Please select or capture an OMR image."
                });
            }

            const student =
                await getEligiblePresentStudent(
                    applicationId
                );

            if (!student) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Counted OMR upload is available only for an eligible PRESENT student."
                });
            }

            /*
             * The browser sends the cropped image.
             * Sharp performs a final conservative document
             * enhancement without changing the original
             * student-uploaded files.
             */
            const outputFileName =
                `rtse-counted-omr-${applicationId}-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 10)}.jpg`;

            const outputPath = path.join(
                STORAGE_DIR,
                outputFileName
            );

            ensureStorageDirectory();

            await sharp(req.file.buffer)
                .rotate()
                .normalize()
                .modulate({
                    brightness: 1.08,
                    saturation: 0.92
                })
                .sharpen({
                    sigma: 1
                })
                .jpeg({
                    quality: 92,
                    mozjpeg: true
                })
                .toFile(outputPath);

            const metadata = await sharp(outputPath)
                .metadata();

            const fileSize =
                fs.statSync(outputPath).size;

            let record;

            try {
                record = await RtseCountedOmr.upsert({
                    application_id: applicationId,
                    file_name: outputFileName,
                    original_name: req.file.originalname
                        ? String(req.file.originalname).slice(0, 255)
                        : "counted-omr.jpg",
                    mime_type: "image/jpeg",
                    file_size: fileSize
                });
            } catch (dbError) {
                /*
                 * Do not leave an unreferenced file if the
                 * database operation fails.
                 */
                try {
                    fs.unlinkSync(outputPath);
                } catch (_) {}

                throw dbError;
            }

            return res.json({
                success: true,
                message: "Counted OMR uploaded successfully.",
                countedOmr: {
                    id: record.id,
                    application_id: applicationId,
                    file_name: outputFileName,
                    mime_type: "image/jpeg",
                    file_size: fileSize,
                    width: metadata.width || null,
                    height: metadata.height || null,
                    view_url:
                        `/admin/rtse/counted-omr/${applicationId}`
                }
            });

        } catch (error) {
            console.error(
                "RTSE Counted OMR Upload Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to process the counted OMR."
            });
        }
    },

    // =====================================
    // Delete Counted OMR
    // =====================================
    async delete(req, res) {
        try {
            const applicationId = Number(req.params.id);

            if (!Number.isInteger(applicationId) || applicationId < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid student ID."
                });
            }

            const record =
                await RtseCountedOmr.getByApplication(applicationId);

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: "Counted OMR not found."
                });
            }

            const safeFileName = path.basename(record.file_name);
            const filePath = path.join(
                STORAGE_DIR,
                safeFileName
            );

            /*
             * Delete only the Counted OMR database record.
             * Never touch the original/generated OMR
             * or any other student upload.
             */
            const deletedRecord =
                await RtseCountedOmr.deleteByApplication(
                    applicationId
                );

            /*
             * Delete only the physical Counted OMR file
             * belonging to the deleted database record.
             */
            if (deletedRecord) {
                try {
                    fs.unlinkSync(filePath);
                } catch (fileError) {
                    if (fileError.code !== "ENOENT") {
                        console.error(
                            "RTSE Counted OMR file cleanup warning:",
                            fileError
                        );
                    }
                }
            }

            return res.json({
                success: true,
                message: "Counted OMR deleted successfully."
            });
        } catch (error) {
            console.error(
                "RTSE Counted OMR Delete Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to delete counted OMR."
            });
        }
    },

    // =====================================
    // View Counted OMR
    // =====================================
    async view(req, res) {
        try {
            const applicationId = Number(
                req.params.id
            );

            if (
                !Number.isInteger(applicationId) ||
                applicationId < 1
            ) {
                return res.status(400).send(
                    "Invalid student ID."
                );
            }

            const record =
                await RtseCountedOmr.getByApplication(
                    applicationId
                );

            if (!record) {
                return res.status(404).send(
                    "Counted OMR not found."
                );
            }

            const student =
                await getEligiblePresentStudent(
                    applicationId
                );

            if (!student) {
                return res.status(403).send(
                    "Counted OMR is not available for this student."
                );
            }

            const safeFileName =
                path.basename(record.file_name);

            const filePath = path.join(
                STORAGE_DIR,
                safeFileName
            );

            if (!fs.existsSync(filePath)) {
                return res.status(404).send(
                    "Counted OMR file is missing."
                );
            }

            res.setHeader(
                "Content-Type",
                record.mime_type || "image/jpeg"
            );

            res.setHeader(
                "Content-Disposition",
                `inline; filename="counted-omr-${applicationId}.jpg"`
            );

            res.setHeader(
                "Cache-Control",
                "private, no-store, max-age=0"
            );

            return res.sendFile(
                filePath
            );

        } catch (error) {
            console.error(
                "RTSE Counted OMR View Error:",
                error
            );

            return res.status(500).send(
                "Unable to open counted OMR."
            );
        }
    }
};

module.exports = controller;
