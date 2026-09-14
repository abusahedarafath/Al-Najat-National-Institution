const RtseExamAttendance =
    require("../models/RtseExamAttendance");

const RtseResultQr =
    require("../models/RtseResultQr");

const RtseResult =
    require("../models/RtseResult");

const { saveRtseResult } =
    require("../utils/rtseResultService");

const superScannerController = {

    // =====================================
    // Super Scanner Dashboard
    // =====================================
    dashboard(req, res) {

        res.render("super-scanner/dashboard", {
            title: "Super Scanner Dashboard",
            user: req.session.user
        });

    },


    // =====================================
    // Lookup QR Code
    // =====================================
    async lookup(req, res) {
        try {
            const token =
                String(req.body.qr_token || "").trim();

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: "QR token is required."
                });
            }

            // =====================================
            // FIRST: Existing Gate QR
            // =====================================
            const attendance =
                await RtseExamAttendance.getByToken(token);

            if (attendance) {

                console.log(
                    "RTSE GATE SCANNER:",
                    {
                        application_id:
                            attendance.application_id,
                        registration_no:
                            attendance.registration_no,
                        roll_no:
                            attendance.roll_no,
                        attendance_status:
                            attendance.attendance_status
                    }
                );

                // ---------------------------------
                // Existing candidate eligibility
                // ---------------------------------
                if (
                    Number(attendance.archive) !== 0 ||
                    attendance.status !== "Approved" ||
                    Number(attendance.admit_generated) !== 1 ||
                    !attendance.roll_no
                ) {
                    return res.status(403).json({
                        success: false,
                        message:
                            "This candidate is not eligible for examination entry."
                    });
                }

                // ---------------------------------
                // Already Present
                // ---------------------------------
                if (
                    attendance.attendance_status === "PRESENT"
                ) {
                    return res.json({
                        success: true,
                        scanType: "GATE",
                        alreadyPresent: true,
                        autoMarked: false,
                        message:
                            "This candidate is already marked PRESENT.",
                        student: {
                            id:
                                attendance.application_id,
                            registration_no:
                                attendance.registration_no,
                            roll_no:
                                attendance.roll_no,
                            full_name:
                                attendance.full_name,
                            father_name:
                                attendance.father_name,
                            school_name:
                                attendance.school_name,
                            class:
                                attendance.class,
                            section:
                                attendance.section,
                            attendance_status:
                                "PRESENT",
                            scanned_at:
                                attendance.scanned_at,
                            photo:
                                attendance.photo
                        }
                    });
                }

                // ---------------------------------
                // Existing Gate verification only
                // ---------------------------------
                return res.json({
                    success: true,
                    scanType: "GATE",
                    alreadyPresent: false,
                    autoMarked: false,
                    message:
                        "✓ Candidate verified successfully. Confirm gate entry.",
                    student: {
                        id:
                            attendance.application_id,
                        registration_no:
                            attendance.registration_no,
                        roll_no:
                            attendance.roll_no,
                        full_name:
                            attendance.full_name,
                        father_name:
                            attendance.father_name,
                        school_name:
                            attendance.school_name,
                        class:
                            attendance.class,
                        section:
                            attendance.section,
                        attendance_status:
                            attendance.attendance_status ||
                            "ABSENT",
                        photo:
                            attendance.photo
                    }
                });
            }

            // =====================================
            // SECOND: Result QR
            // =====================================
            const resultQr =
                await RtseResultQr.getByToken(token);

            if (!resultQr) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Invalid or unrecognized RTSE QR code."
                });
            }

            console.log(
                "RTSE RESULT QR SCANNER:",
                {
                    application_id:
                        resultQr.application_id,
                    registration_no:
                        resultQr.registration_no,
                    roll_no:
                        resultQr.roll_no
                }
            );

            // ---------------------------------
            // Result QR candidate eligibility
            // ---------------------------------
            if (
                Number(resultQr.archive) !== 0 ||
                resultQr.status !== "Approved" ||
                Number(resultQr.admit_generated) !== 1 ||
                !resultQr.roll_no
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "This candidate is not eligible for result entry."
                });
            }

            // ---------------------------------
            // Result QR does NOT create or alter
            // attendance. It only checks the
            // authoritative Gate attendance state.
            // ---------------------------------
            const resultAttendance =
                await RtseExamAttendance.getByApplication(
                    resultQr.application_id
                );

            // ---------------------------------
            // Result QR exists but is not active
            // until Gate Entry is PRESENT.
            // ---------------------------------
            if (
                !resultAttendance ||
                resultAttendance.attendance_status !== "PRESENT"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Result entry is locked. Gate entry must be confirmed first."
                });
            }

            // ---------------------------------
            // Existing result, if any
            // ---------------------------------
            const existingResult =
                await RtseResult.getByApplication(
                    resultQr.application_id
                );

            return res.json({
                success: true,
                scanType: "RESULT",
                alreadyPresent: false,
                autoMarked: false,
                message:
                    "✓ Result QR verified. Result entry is available.",
                student: {
                    id:
                        resultQr.application_id,
                    registration_no:
                        resultQr.registration_no,
                    roll_no:
                        resultQr.roll_no,
                    full_name:
                        resultQr.full_name,
                    father_name:
                        resultQr.father_name,
                    school_name:
                        resultQr.school_name,
                    class:
                        resultQr.class,
                    section:
                        resultQr.section,
                    attendance_status:
                        "PRESENT",
                    photo:
                        resultQr.photo
                },
                result:
                    existingResult
            });

        } catch (error) {
            console.error(
                "Super Scanner Lookup Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to process QR code."
            });
        }
    },

    // =====================================
    // Save Result from Result QR
    // =====================================
    async saveResult(req, res) {
        try {
            const applicationId =
                String(req.params.id || "").trim();

            const token =
                String(req.body.qr_token || "").trim();

            if (!applicationId || !token) {
                return res.status(400).json({
                    success: false,
                    message: "Result QR token and student are required."
                });
            }

            const resultQr =
                await RtseResultQr.getByToken(token);

            if (
                !resultQr ||
                String(resultQr.application_id) !== applicationId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid Result QR code."
                });
            }

            if (
                Number(resultQr.archive) !== 0 ||
                resultQr.status !== "Approved" ||
                Number(resultQr.admit_generated) !== 1 ||
                !resultQr.roll_no
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "This candidate is not eligible for result entry."
                });
            }

            const attendance =
                await RtseExamAttendance.getByApplication(
                    applicationId
                );

            /*
             * Server-side authorization:
             * Result QR can only save a result after the same
             * student's gate entry has been confirmed PRESENT.
             */
            if (
                !attendance ||
                attendance.attendance_status !== "PRESENT"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Result entry is locked. Gate entry must be confirmed first."
                });
            }

            /*
             * Preserve an existing rank when Result QR editing is used.
             * The Super Scanner intentionally does not expose rank editing.
             */
            const existingResult =
                await RtseResult.getByApplication(
                    applicationId
                );

            const resultBody = {
                ...(req.body || {})
            };

            if (
                existingResult &&
                resultBody.rank_no === undefined
            ) {
                resultBody.rank_no =
                    existingResult.rank_no;
            }

            const result =
                await saveRtseResult(
                    applicationId,
                    resultBody
                );

            return res.json({
                success: true,
                message: "Result saved successfully.",
                result
            });
        } catch (error) {
            console.error(
                "Super Scanner Result Save Error:",
                error
            );

            return res.status(400).json({
                success: false,
                message:
                    error && error.message
                        ? error.message
                        : "Unable to save result."
            });
        }
    },

    // =====================================
    // Mark Candidate Present
    // =====================================
    async markPresent(req, res) {

        try {

            const token =
                String(req.body.qr_token || "").trim();

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: "QR token is required."
                });
            }

            const attendance =
                await RtseExamAttendance.getByToken(token);

            if (!attendance) {
                return res.status(404).json({
                    success: false,
                    message: "Invalid or unrecognized RTSE QR code."
                });
            }

            if (
                Number(attendance.archive) !== 0 ||
                attendance.status !== "Approved" ||
                Number(attendance.admit_generated) !== 1 ||
                !attendance.roll_no
            ) {
                return res.status(403).json({
                    success: false,
                    message: "This candidate is not eligible for examination entry."
                });
            }

            if (attendance.attendance_status === "PRESENT") {
                return res.json({
                    success: true,
                    alreadyPresent: true,
                    message: "Attendance has already been marked PRESENT.",
                    student: {
                        registration_no: attendance.registration_no,
                        roll_no: attendance.roll_no,
                        full_name: attendance.full_name
                    }
                });
            }

            const marked =
                await RtseExamAttendance.markPresent(
                    attendance.application_id,
                    req.session.user.id
                );

            if (!marked) {
                return res.status(409).json({
                    success: false,
                    message: "Attendance could not be marked. Please scan again."
                });
            }

            return res.json({
                success: true,
                alreadyPresent: false,
                message: "Attendance marked PRESENT successfully.",
                student: {
                    registration_no: attendance.registration_no,
                    roll_no: attendance.roll_no,
                    full_name: attendance.full_name
                }
            });

        } catch (error) {

            console.error(
                "Super Scanner Attendance Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to mark attendance."
            });

        }

    }

};

module.exports = superScannerController;
