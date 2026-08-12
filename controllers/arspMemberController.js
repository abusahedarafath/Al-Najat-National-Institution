const ArspMember = require("../models/ArspMember");
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
