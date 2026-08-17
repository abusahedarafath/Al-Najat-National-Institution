const RtseExamAttendance =
    require("../models/RtseExamAttendance");

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
    // Lookup QR Code + Automatic Attendance
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

            const attendance =
                await RtseExamAttendance.getByToken(token);

            if (!attendance) {

                return res.status(404).json({
                    success: false,
                    message: "Invalid or unrecognized RTSE QR code."
                });

            }

            console.log(
                "RTSE SCANNER ELIGIBILITY:",
                {
                    application_id:
                        attendance.application_id,

                    registration_no:
                        attendance.registration_no,

                    status:
                        attendance.status,

                    admit_generated:
                        attendance.admit_generated,

                    archive:
                        attendance.archive,

                    roll_no:
                        attendance.roll_no,

                    attendance_status:
                        attendance.attendance_status
                }
            );

            // ---------------------------------
            // Candidate eligibility
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

                    alreadyPresent: true,

                    autoMarked: false,

                    message:
                        "This candidate is already marked PRESENT.",

                    student: {

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
                            attendance.scanned_at

                    }

                });

            }

            // ---------------------------------
            // AUTOMATICALLY MARK PRESENT
            // ---------------------------------

            const marked =
                await RtseExamAttendance.markPresent(
                    attendance.application_id,
                    req.session.user.id
                );

            if (!marked) {

                return res.status(409).json({
                    success: false,
                    message:
                        "Attendance could not be marked. Please scan again."
                });

            }

            // ---------------------------------
            // Successful scan + attendance
            // ---------------------------------

            return res.json({

                success: true,

                alreadyPresent: false,

                autoMarked: true,

                message:
                    "✓ Attendance marked PRESENT successfully.",

                student: {

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
                        "PRESENT"

                }

            });

        } catch (error) {

            console.error(
                "Super Scanner Lookup / Automatic Attendance Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to process attendance."
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
