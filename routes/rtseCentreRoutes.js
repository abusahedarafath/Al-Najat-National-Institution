const express = require("express");

const router = express.Router();

const authController =
    require("../controllers/rtseCentreAuthController");

const centreAuth =
    require("../middleware/rtseCentreAuth");

// =====================================
// Public Centre Login
// =====================================
router.get(
    "/rtse/centre/login",
    authController.loginPage
);

router.post(
    "/rtse/centre/login",
    authController.login
);

// =====================================
// Centre Password Change
// =====================================
router.get(
    "/rtse/centre/change-password",
    centreAuth.isCentreLoggedIn,
    authController.changePasswordPage
);

router.post(
    "/rtse/centre/change-password",
    centreAuth.isCentreLoggedIn,
    authController.changePassword
);

// =====================================
// Centre Dashboard Placeholder
// =====================================
router.get(
    "/rtse/centre/dashboard",
    centreAuth.isCentreLoggedIn,
    centreAuth.requirePasswordChanged,
    async (req, res) => {
        try {
            const RtseCentre = require("../models/RtseCentre");

            const centreId =
                Number(req.session.rtseCentre.centre_db_id);

            if (!Number.isInteger(centreId) || centreId <= 0) {
                return res.status(400).send(
                    "Invalid Centre account."
                );
            }

            /*
             * Dashboard data is read-only.
             * No uploaded files are accessed or modified.
             */
            const stats =
                await RtseCentre.getPortalDashboardStats(
                    centreId
                );

            const students =
                await RtseCentre.getPortalStudents(
                    centreId,
                    "",
                    "",
                    ""
                );

            const assignedSchools =
                await RtseCentre.getAssignedSchools(
                    centreId
                );

            return res.render(
                "rtse/centre/dashboard",
                {
                    title: "RTSE Centre Dashboard",
                    centre: req.centre,
                    centreAccount: req.centreAccount,
                    stats,
                    students,
                    assignedSchools
                }
            );
        } catch (err) {
            console.error(
                "RTSE Centre Dashboard Error:",
                err
            );

            return res.status(500).send(
                "Unable to load Centre Dashboard."
            );
        }
    }
);

// =====================================
// Assigned Schools
// =====================================
router.get(
    "/rtse/centre/schools",
    centreAuth.isCentreLoggedIn,
    centreAuth.requirePasswordChanged,
    async (req, res) => {
        try {
            const RtseCentre =
                require("../models/RtseCentre");

            const centreId =
                Number(req.session.rtseCentre.centre_db_id);

            if (!Number.isInteger(centreId) || centreId <= 0) {
                return res.status(400).send(
                    "Invalid Centre account."
                );
            }

            const assignedSchools =
                await RtseCentre.getAssignedSchools(
                    centreId
                );

            return res.render(
                "rtse/centre/schools",
                {
                    title: "Assigned Schools - RTSE Centre",
                    centre: req.centre,
                    centreAccount: req.centreAccount,
                    assignedSchools
                }
            );
        } catch (err) {
            console.error(
                "RTSE Centre Assigned Schools Error:",
                err
            );

            return res.status(500).send(
                "Unable to load Assigned Schools."
            );
        }
    }
);

// =====================================
// =====================================
// Centre Student Registry
// =====================================
router.get(
    "/rtse/centre/students",
    centreAuth.isCentreLoggedIn,
    centreAuth.requirePasswordChanged,
    async (req, res) => {
        try {
            const RtseCentre = require("../models/RtseCentre");

            const centreId = Number(req.session.rtseCentre.centre_db_id);

            if (!Number.isInteger(centreId) || centreId <= 0) {
                return res.status(400).send("Invalid Centre account.");
            }

            const search = String(req.query.search || "").trim();
            const status = String(req.query.status || "").trim();
            const year = String(req.query.year || "").trim();

            const applicationYears =
                await RtseCentre.getPortalApplicationYears(centreId);

            const students = await RtseCentre.getPortalStudents(
                centreId,
                search,
                status,
                year
            );

            return res.render("rtse/centre/students", {
                title: "Centre Student Registry",
                centre: req.centre,
                centreAccount: req.centreAccount,
                students,
                applicationYears,
                search,
                status,
                selectedYear: year
            });
        } catch (err) {
            console.error("RTSE Centre Student Registry Error:", err);
            return res.status(500).send(
                "Unable to load Centre Student Registry."
            );
        }
    }
);

// =====================================
// Centre Candidate Details
// =====================================
router.get(
    "/rtse/centre/student/:id",
    centreAuth.isCentreLoggedIn,
    centreAuth.requirePasswordChanged,
    async (req, res) => {
        try {
            const RtseCentre = require("../models/RtseCentre");

            const centreId = Number(
                req.session.rtseCentre.centre_db_id
            );

            const studentId = Number(req.params.id);

            if (!Number.isInteger(centreId) || centreId <= 0) {
                return res.status(400).send("Invalid Centre account.");
            }

            if (!Number.isInteger(studentId) || studentId <= 0) {
                return res.status(400).send("Invalid candidate.");
            }

            const student =
                await RtseCentre.getPortalStudentById(
                    centreId,
                    studentId
                );

            // Deliberately return 404 instead of exposing
            // whether a candidate exists outside this centre.
            if (!student) {
                return res.status(404).send(
                    "Candidate not found in this Centre."
                );
            }

            return res.render(
                "rtse/centre/student-details",
                {
                    title: "Candidate Details",
                    centre: req.centre,
                    centreAccount: req.centreAccount,
                    student
                }
            );
        } catch (err) {
            console.error(
                "RTSE Centre Candidate Details Error:",
                err
            );

            return res.status(500).send(
                "Unable to load candidate details."
            );
        }
    }
);

// =====================================
    // Centre Candidate Admit Card
    // Centre-scoped: only candidates assigned to
    // the logged-in examination centre are accessible.
    // =====================================
    router.get(
        "/rtse/centre/student/:id/admit-card",
        centreAuth.isCentreLoggedIn,
        centreAuth.requirePasswordChanged,
        async (req, res) => {
            try {
                const RtseCentre = require("../models/RtseCentre");
                const RtseExamAttendance = require("../models/RtseExamAttendance");
                const RtseExamSetting = require("../models/RtseExamSetting");
                const QRCode = require("qrcode");
                const ArspSetting = require("../models/ArspSetting");

                const centreId = Number(
                    req.session.rtseCentre.centre_db_id
                );

                const studentId = Number(req.params.id);

                if (!Number.isInteger(centreId) || centreId <= 0) {
                    return res.status(400).send(
                        "Invalid Centre account."
                    );
                }

                if (!Number.isInteger(studentId) || studentId <= 0) {
                    return res.status(400).send(
                        "Invalid candidate."
                    );
                }

                // SECURITY:
                // Candidate must belong to this authenticated Centre.
                const student =
                    await RtseCentre.getPortalStudentById(
                        centreId,
                        studentId
                    );

                if (!student) {
                    return res.status(404).send(
                        "Candidate not found in this Centre."
                    );
                }

                // Admit card is available only after generation.
                if (
                    Number(student.admit_generated) !== 1 ||
                    student.status !== "Approved" ||
                    !student.roll_no
                ) {
                    return res.status(404).send(
                        "Admit Card is not available for this candidate."
                    );
                }

                // Preserve the existing attendance/QR system.
                const attendance =
                    await RtseExamAttendance.ensureForApplication(
                        student.id
                    );

                let qrData = null;

                if (attendance && attendance.qr_token) {
                    qrData = await QRCode.toDataURL(
                        attendance.qr_token,
                        {
                            width: 180,
                            margin: 2,
                            errorCorrectionLevel: "M"
                        }
                    );
                }

                const setting = await ArspSetting.get();
                const examSetting = await RtseExamSetting.get();

                return res.render(
                    "rtse/student-admit-card",
                    {
                        title: "RTSE Admit Card",
                        setting,
                        student,
                        attendance,
                        qrData,
                        examSetting,
                        examYear:
                            examSetting?.exam_year ||
                            setting?.exam_year ||
                            new Date().getFullYear(),

                        // Centre Portal context
                        centrePortal: true,
                        centre: req.centre,
                        centreAccount: req.centreAccount,

                        // Return destination for the Centre Portal.
                        backUrl:
                            "/rtse/centre/student/" +
                            encodeURIComponent(
                                String(student.id)
                            )
                    }
                );
            } catch (err) {
                console.error(
                    "RTSE Centre Admit Card Error:",
                    err
                );

                return res.status(500).send(
                    "Unable to load Admit Card."
                );
            }
        }
    );

    // =====================================
  // Centre School Assignment Approval
  // =====================================

  router.post(
      "/rtse/centre/assignment/:id/approve",
      centreAuth.isCentreLoggedIn,
      centreAuth.requirePasswordChanged,
      async (req, res) => {
          try {
              const RtseCentre =
                  require("../models/RtseCentre");

              const centreId = Number(
                  req.session.rtseCentre.centre_db_id
              );

              const centreAccountId = Number(
                  req.session.rtseCentre.account_id
              );

              const assignmentId = Number(
                  req.params.id
              );

              if (
                  !Number.isInteger(centreId) ||
                  centreId <= 0 ||
                  !Number.isInteger(centreAccountId) ||
                  centreAccountId <= 0 ||
                  !Number.isInteger(assignmentId) ||
                  assignmentId <= 0
              ) {
                  return res.status(400).send(
                      "Invalid Centre or assignment."
                  );
              }

              const approved =
                  await RtseCentre.approveCentreAssignment(
                      centreId,
                      assignmentId,
                      centreAccountId
                  );

              if (!approved) {
                  return res.status(409).send(
                      "Unable to approve this assignment."
                  );
              }

              return res.redirect(
                  "/rtse/centre/dashboard"
              );

          } catch (err) {
              console.error(
                  "Centre Assignment Approval Error:",
                  err
              );

              return res.status(400).send(
                  err.message ||
                  "Unable to approve assignment."
              );
          }
      }
  );

  // =====================================
  // Centre School Assignment Rejection
  // =====================================

  router.post(
      "/rtse/centre/assignment/:id/reject",
      centreAuth.isCentreLoggedIn,
      centreAuth.requirePasswordChanged,
      async (req, res) => {
          try {
              const RtseCentre =
                  require("../models/RtseCentre");

              const centreId = Number(
                  req.session.rtseCentre.centre_db_id
              );

              const centreAccountId = Number(
                  req.session.rtseCentre.account_id
              );

              const assignmentId = Number(
                  req.params.id
              );

              if (
                  !Number.isInteger(centreId) ||
                  centreId <= 0 ||
                  !Number.isInteger(centreAccountId) ||
                  centreAccountId <= 0 ||
                  !Number.isInteger(assignmentId) ||
                  assignmentId <= 0
              ) {
                  return res.status(400).send(
                      "Invalid Centre or assignment."
                  );
              }

              const remarks =
                  String(
                      req.body.remarks || ""
                  ).trim();

              const rejected =
                  await RtseCentre.rejectCentreAssignment(
                      centreId,
                      assignmentId,
                      centreAccountId,
                      remarks
                  );

              if (!rejected) {
                  return res.status(409).send(
                      "Unable to reject this assignment."
                  );
              }

              return res.redirect(
                  "/rtse/centre/dashboard"
              );

          } catch (err) {
              console.error(
                  "Centre Assignment Rejection Error:",
                  err
              );

              return res.status(400).send(
                  err.message ||
                  "Unable to reject assignment."
              );
          }
      }
  );

  // Logout
// =====================================
router.get(
    "/rtse/centre/logout",
    centreAuth.isCentreLoggedIn,
    authController.logout
);

router.post(
    "/rtse/centre/logout",
    centreAuth.isCentreLoggedIn,
    authController.logout
);

module.exports = router;
