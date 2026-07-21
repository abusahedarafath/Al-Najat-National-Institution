const bcrypt = require("bcryptjs");const Application = require("../../models/Application");
const Student = require("../../models/Student");
const StudentUser = require("../../models/StudentUser");

/**
 * Show all applications
 */
exports.showApplications = (req, res) => {
    Application.getAll((err, applications) => {
        if (err) {
            console.error(err);
            req.flash("error", "Unable to load applications.");
            return res.redirect("/admin");
        }

        res.render("admin/applications", {
            title: "Applications",
            applications
        });
    });
};


/**
 * View single application
 */
exports.viewApplication = (req, res) => {

    const id = req.params.id;

    Application.getById(id, (err, application) => {

        if (err || !application) {
            req.flash("error", "Application not found.");
            return res.redirect("/admin/applications");
        }

        res.render("admin/application-details", {
            title: "Application Details",
            application
        });

    });

};


/**
 * Approve application
 */
exports.approveApplication = (req, res) => {

    const applicationId = req.params.id;

    Application.getById(applicationId, async (err, application) => {

        if (err || !application) {
            req.flash("error", "Application not found.");
            return res.redirect("/admin/applications");
        }

        Application.updateStatus(applicationId, "Approved", async (err2) => {

            if (err2) {
                req.flash("error", "Unable to approve application.");
                return res.redirect("/admin/application/" + applicationId);
            }

            Student.findByApplicationId(applicationId, async (err3, existingStudent) => {

                if (err3) {
                    console.error(err3);
                    req.flash("error", "Database error.");
                    return res.redirect("/admin/application/" + applicationId);
                }

                if (existingStudent) {
                    req.flash("success", "Application approved successfully.");
                    return res.redirect("/admin/application/" + applicationId);
                }

                Student.getNextStudentNumber(async (err4, nextNumber) => {

                    if (err4) {
                        console.error(err4);
                        req.flash("error", "Unable to generate Student ID.");
                        return res.redirect("/admin/application/" + applicationId);
                    }

                    const year = new Date().getFullYear();

                    const studentId =
                        "ANI" +
                        year +
                        String(nextNumber).padStart(4, "0");

                    const studentData = {
                        student_id: studentId,
                        application_id: application.id,
                        full_name: application.full_name,
                        father_name: application.father_name,
                        mother_name: application.mother_name,
                        dob: application.dob,
                        gender: application.gender,
                        mobile: application.mobile,
                        email: application.email,
                        address: application.address,
                        course: application.course,
                        previous_school: application.previous_school,
                        admission_date: new Date(),
                        status: "Active"
                    };

                    Student.create(studentData, async (err5) => {

                        if (err5) {
                            console.error(err5);
                            req.flash("error", "Unable to create student.");
                            return res.redirect("/admin/application/" + applicationId);
                        }

                        try {

                            const plainPassword =
                                application.mobile.slice(-6);

                            const hashedPassword =
                                await bcrypt.hash(plainPassword, 10);

                            const loginData = {
                                student_id: studentId,
                                username: studentId,
                                password: hashedPassword
                            };

                            StudentUser.create(loginData, (err6) => {

                                if (err6) {
                                    console.error(err6);
                                    req.flash(
                                        "error",
                                        "Student created but login creation failed."
                                    );

                                    return res.redirect(
                                        "/admin/application/" + applicationId
                                    );
                                }

                                req.flash(
                                    "success",
                                    `Application approved successfully. Student ID: ${studentId}`
                                );

                                res.redirect(
                                    "/admin/application/" + applicationId
                                );

                            });

                        } catch (error) {

                            console.error(error);

                            req.flash(
                                "error",
                                "Password generation failed."
                            );

                            res.redirect(
                                "/admin/application/" + applicationId
                            );

                        }

                    });

                });

            });

        });

    });

};


/**
 * Reject application
 */
exports.rejectApplication = (req, res) => {

    const id = req.params.id;

    Application.updateStatus(id, "Rejected", (err) => {

        if (err) {

            req.flash("error", "Unable to reject application.");

            return res.redirect("/admin/application/" + id);

        }

        req.flash("success", "Application rejected.");

        res.redirect("/admin/application/" + id);

    });

};
