const ArspMember = require("../models/ArspMember");
const RtseApplication = require("../models/RtseApplication");
const RtseResult = require("../models/RtseResult");
const RtseSetting = require("../models/RtseSetting");
const path = require("path");
const fs = require("fs");

// =====================================
// Member Dashboard
// =====================================

exports.dashboard = async (req, res) => {
    try {

        const member = await ArspMember.getById(
            req.session.arspMember.id
        );

        if (!member) {
            req.flash("error", "Member account not found.");
            return res.redirect("/arsp/login");
        }

        res.render("arsp/dashboard", {
            title: "ARSP Member Dashboard",
            member
        });

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load member dashboard."
        );

        res.redirect("/arsp/login");
    }
};


// =====================================
// Edit My Profile
// =====================================

exports.searchStudentForAdmitCard = async (req, res) => {

  try {

    if (
      !req.session ||
      !req.session.arspMember ||
      !req.session.arspMember.id
    ) {
      return res.status(401).json({
        success: false,
        message: "ARSP member login required."
      });
    }

    const keyword =
      String(
        req.query.keyword ||
        req.query.registration_no ||
        ""
      ).trim();

    if (!keyword) {
      return res.json({
        success: true,
        students: [],
        student: null
      });
    }

    // Always fetch the current member record.
    // Access changes made by Admin therefore take effect immediately.
    const member =
      await ArspMember.getById(
        req.session.arspMember.id
      );

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "ARSP member account could not be verified."
      });
    }

    const access =
      String(
        member.admit_card_access || "Partial"
      ).trim();

    // Full Access: universal student search.
    if (access === "Full") {

      const students =
        await RtseApplication.searchForAdmitCardUniversal(
          keyword
        );

      return res.json({
        success: true,
        access: "Full",
        students,
        student: students.length === 1
          ? students[0]
          : null
      });
    }

    // Partial Access: search by registration number,
    // student name, or father name.
    const students =
      await RtseApplication.searchForAdmitCardPartial(
        keyword
      );

    return res.json({
      success: true,
      access: "Partial",
      students,
      student: students.length === 1
        ? students[0]
        : null
    });

  } catch (error) {

    console.error(
      "ARSP admit-card student search error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to search student."
    });
  }
};


// =====================================
// Member Result Verification
// =====================================

function normalizeMemberMobile(value) {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizeMemberDob(value) {
    const raw = String(value || "").trim();

    if (!raw) {
        return "";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }

    const match = raw.match(
        /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/
    );

    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return "";
}

function formatMemberDob(value) {
    if (!value) {
        return "";
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return String(value).slice(0, 10);
    }

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
}

function calculateMemberComponentGrade(marks, maximumMarks) {
    const obtained = Number(marks);
    const maximum = Number(maximumMarks);

    if (
        !Number.isFinite(obtained) ||
        !Number.isFinite(maximum) ||
        maximum <= 0
    ) {
        return "";
    }

    const percentage = (obtained / maximum) * 100;

    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    return "F";
}

function buildMemberResultPayload(student) {
    const components = Array.isArray(student.component_marks)
        ? student.component_marks
            .map(component => {
                if (Number(component.grade_counting) !== 1) {
                    return null;
                }

                return {
                    component_id: component.component_id,
                    name: component.name,
                    grade: calculateMemberComponentGrade(
                        component.marks,
                        component.maximum_marks
                    )
                };
            })
            .filter(Boolean)
        : [];

    return {
        application_id: student.application_id,
        registration_no: student.registration_no,
        roll_no: student.roll_no,
        full_name: student.full_name,
        class: student.class,
        section: student.section,
        photo: student.photo || null,
        omr_marks: student.marks ?? null,
        section_rank: student.section_rank,
        overall_rank: student.overall_rank,
        component_grades: components
    };
}

exports.verifyStudentResult = async (req, res) => {
    try {
        if (
            !req.session ||
            !req.session.arspMember ||
            !req.session.arspMember.id
        ) {
            return res.status(401).json({
                success: false,
                message: "ARSP member login required."
            });
        }

        const registrationNo = String(
            req.body.registration_no || ""
        ).trim();

        const credentialType = String(
            req.body.credential_type || ""
        ).trim().toLowerCase();

        const credentialValue = String(
            req.body.credential_value || ""
        ).trim();

        if (
            !registrationNo ||
            !credentialValue ||
            !["mobile", "dob"].includes(credentialType)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid verification details."
            });
        }

        const member = await ArspMember.getById(
            req.session.arspMember.id
        );

        if (!member) {
            return res.status(403).json({
                success: false,
                message: "ARSP member account could not be verified."
            });
        }

        const access =
            String(member.admit_card_access || "Partial").trim();

        const rtseSetting = await RtseSetting.get();

        if (
            !rtseSetting ||
            Number(rtseSetting.result_publish) !== 1
        ) {
            return res.status(403).json({
                success: false,
                message: "Results are not published yet."
            });
        }

        const application =
            await RtseResult.getMemberResultVerificationApplication(
                registrationNo
            );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Result not found for this student."
            });
        }

        let verified = false;

        if (access === "Full") {
            if (credentialType !== "mobile") {
                return res.status(400).json({
                    success: false,
                    message:
                        "Full Access requires your registered member mobile number."
                });
            }

            const enteredMobile =
                normalizeMemberMobile(credentialValue);

            const memberMobile =
                normalizeMemberMobile(member.mobile);

            verified =
                enteredMobile.length === 10 &&
                enteredMobile === memberMobile;
        } else {
            if (credentialType === "mobile") {
                const enteredMobile =
                    normalizeMemberMobile(credentialValue);

                const studentMobile =
                    normalizeMemberMobile(application.mobile);

                verified =
                    enteredMobile.length === 10 &&
                    enteredMobile === studentMobile;
            }

            if (credentialType === "dob") {
                const enteredDob =
                    normalizeMemberDob(credentialValue);

                const storedDob =
                    formatMemberDob(application.dob);

                verified =
                    Boolean(enteredDob) &&
                    Boolean(storedDob) &&
                    enteredDob === storedDob;
            }
        }

        if (!verified) {
            return res.status(401).json({
                success: false,
                message:
                    "Verification failed. Please check the entered details."
            });
        }

        const student =
            await RtseResult.getStudentPopupResult(
                application.application_id
            );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Result data was not found."
            });
        }

        return res.json({
            success: true,
            result: buildMemberResultPayload(student)
        });
    } catch (error) {
        console.error(
            "ARSP member result verification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to verify student result."
        });
    }
};

exports.editProfilePage = async (req, res) => {

    try {

        const member = await ArspMember.getById(
            req.session.arspMember.id
        );

        if (!member) {
            req.flash("error", "Member account not found.");
            return res.redirect("/arsp/login");
        }

        res.render("arsp/edit-profile", {
            title: "Edit My Profile",
            member
        });

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load your profile."
        );

        res.redirect("/arsp/dashboard");
    }
};


// =====================================
// Update My Profile
// =====================================

exports.updateProfile = async (req, res) => {

    try {

        // IMPORTANT:
        // Never trust a member ID submitted by the browser.
        // Always use the authenticated session.
        const memberId = req.session.arspMember.id;

        const oldMember = await ArspMember.getById(memberId);

        if (!oldMember) {
            req.flash("error", "Member account not found.");
            return res.redirect("/arsp/login");
        }

        const allowedGenders = [
            "Male",
            "Female",
            "Other"
        ];

        let gender = req.body.gender || null;

        if (gender && !allowedGenders.includes(gender)) {
            gender = oldMember.gender;
        }

        let photo = oldMember.photo;

        if (req.file) {

            const allowedImageTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedImageTypes.includes(req.file.mimetype)) {

                const uploadedPath = path.join(
                    __dirname,
                    "../public/uploads/arsp-members",
                    path.basename(req.file.filename)
                );

                if (fs.existsSync(uploadedPath)) {
                    fs.unlinkSync(uploadedPath);
                }

                req.flash(
                    "error",
                    "Only JPG, JPEG, PNG or WEBP images are allowed."
                );

                return res.redirect("/arsp/profile/edit");
            }

            photo = req.file.filename;
        }

        await ArspMember.updateOwnProfile(
            memberId,
            {
                full_name:
                    (req.body.full_name || "").trim(),

                father_name:
                    (req.body.father_name || "").trim(),

                mother_name:
                    (req.body.mother_name || "").trim(),

                gender,

                dob:
                    req.body.dob || null,

                blood_group:
                    (req.body.blood_group || "").trim(),

                occupation:
                    (req.body.occupation || "").trim(),

                mobile:
                    (req.body.mobile || "").trim(),

                email:
                    (req.body.email || "").trim(),

                address:
                    (req.body.address || "").trim(),

                district:
                    (req.body.district || "").trim(),

                state:
                    (req.body.state || "").trim(),

                pincode:
                    (req.body.pincode || "").trim(),

                emergency_contact_name:
                    (req.body.emergency_contact_name || "").trim(),

                emergency_contact_relation:
                    (req.body.emergency_contact_relation || "").trim(),

                emergency_contact_mobile:
                    (req.body.emergency_contact_mobile || "").trim(),

                photo
            }
        );

        // Delete old photo only after successful DB update.
        if (
            req.file &&
            oldMember.photo &&
            oldMember.photo !== photo
        ) {

            const oldPhotoPath = path.join(
                __dirname,
                "../public/uploads/arsp-members",
                path.basename(oldMember.photo)
            );

            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        req.flash(
            "success",
            "Your profile has been updated successfully."
        );

        return res.redirect("/arsp/dashboard");

    } catch (err) {

        console.error(err);

        // Remove newly uploaded file if DB update failed.
        if (req.file) {

            const uploadedPath = path.join(
                __dirname,
                "../public/uploads/arsp-members",
                path.basename(req.file.filename)
            );

            if (fs.existsSync(uploadedPath)) {
                try {
                    fs.unlinkSync(uploadedPath);
                } catch (deleteError) {
                    console.error(deleteError);
                }
            }
        }

        req.flash(
            "error",
            "Unable to update your profile."
        );

        return res.redirect("/arsp/profile/edit");
    }
};
