const fs = require("fs");
const path = require("path");
const ArspMember = require("../models/ArspMember");
const ArspAccount = require("../models/ArspAccount");


const ArspSetting = require("../models/ArspSetting");

const ArspRegistrationService = require("../services/arspRegistrationService");


const ArspDocumentVerification = require("../models/ArspDocumentVerification");


const ArspCommittee = require("../models/ArspCommittee");
const ArspManagementPosition = require("../models/ArspManagementPosition");

const ArspDesignation = require("../models/ArspDesignation");


const generateQRCode = require("../utils/qrGenerator");




// =====================================
// ARSP Dashboard
// =====================================

// =====================================
// ARSP Dashboard
// =====================================

exports.dashboard = async (req, res) => {

    try {

        const members = await ArspMember.getAll();

        const stats =
            await ArspManagementPosition.getDashboardCounts();

        const committeeCount =
            await ArspCommittee.count();

        res.render("admin/arsp/dashboard", {

            title: "ARSP Dashboard",

            totalMembers: members.length,

            founderCount: stats.founder,

            chiefAdviserCount: stats.chiefAdviser,

            organizingBodyCount: stats.organizingBody,

            advisoryBodyCount: stats.advisoryBody,

            committeeCount

        });

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to load dashboard."
        );

        res.redirect("/admin");

    }

};


// =====================================
// Register Member Page
// =====================================

exports.registerPage = (req, res) => {

    res.render("admin/arsp/register-member", {

        title: "Register ARSP Member",

        isEdit: false,

        member: {}

    });

};

// =====================================
// Register Member
// =====================================



exports.registerMember = async (req, res) => {

    try {

        const ArspSetting =
            require("../models/ArspSetting");

        const result =
            await ArspRegistrationService.register(

                {

                    ...req.body,

                    registration_source:
                        "Admin",

                    approval_status:
                        "Approved"

                },

                req

            );

        const setting =
            await ArspSetting.get();

        req.session.lastArspRegistration = {

            memberId:
                result.member.member_id,

            memberDbId:
                result.member.id,

            password:
                result.password,

            loginUrl:
                result.loginUrl,

            registrationSource:
                "Registered by Admin"

        };

        return res.render(

            "arsp-documents/membership-registration-slip",

            {

                title:
                    "Membership Registration Slip",

                setting,

                member:
                    result.member,

                username:
                    result.memberId,

                password:
                    result.password,

                loginUrl:
                    result.loginUrl,

                registrationSource:
                    "Registered by Admin"

            }

        );

    }

    catch(err){

        console.error(err);

        res.send(
            "<pre>"+err.stack+"</pre>"
        );

    }

};










// =====================================
// Member Registry
// =====================================

exports.members = async (req, res) => {

    try {

        const search = req.query.search || "";

        const members = await ArspMember.getAll(search);

        res.render("admin/arsp/members", {

            title: "Member Registry",

            members,

            search

        });

    } catch (err) {

        console.error(err);

        req.flash("error", "Unable to load members.");

        res.redirect("/admin");

    }

};

// =====================================
// Founder
// =====================================

exports.founder = async (req, res) => {

    try {

        const members =
            await ArspManagementPosition.getFounder();

        res.render(

            "admin/arsp/management-body",

            {

                title: "Founder of ARSP",

                members

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load Founder."

        );

        res.redirect("/admin/arsp");

    }

};


// =====================================
// Organizing Body
// =====================================

exports.organizingBody = async (req, res) => {

    try {

        const members =
            await ArspManagementPosition.getOrganizingBody();

        res.render(

            "admin/arsp/management-body",

            {

                title: "Organizing Body",

                members

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load Organizing Body."

        );

        res.redirect("/admin/arsp");

    }

};

// =====================================
// Chief Adviser
// =====================================

exports.chiefAdviser = async (req, res) => {

    try {

        const adviser =
            await ArspManagementPosition.getChiefAdviser();

        const members = adviser ? [adviser] : [];

        res.render(

            "admin/arsp/management-body",

            {

                title: "Chief Adviser",

                members

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load Chief Adviser."

        );

        res.redirect("/admin/arsp");

    }

};

// =====================================
// Advisory Body
// =====================================



exports.advisoryBody = async (req, res) => {

    try {

        const members =
            await ArspManagementPosition.getAdvisoryBody();

        res.render(

            "admin/arsp/management-body",

            {

                title: "Advisory Body",

                members

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load Advisory Body."

        );

        res.redirect("/admin/arsp");

    }

};



// =====================================
// Assign Position Page
// =====================================

exports.assignPositionPage = async (req, res) => {

    try {

        const member = await ArspMember.getById(req.params.id);

        if (!member) {

            req.flash("error", "Member not found.");

            return res.redirect("/admin/arsp/members");

        }

        const committees =
            await ArspCommittee.getAll();

        const designations =
            await ArspDesignation.getActive();

        res.render("admin/arsp/assign-position", {

            title: "Assign Position",

            member,

            committees,

            designations

        });

    } catch (err) {

        console.error(err);

        req.flash("error", "Unable to load page.");

        res.redirect("/admin/arsp/members");

    }

};



// =====================================
// Remove Position
// =====================================

exports.removePosition = async (req, res) => {

    try {

        await ArspManagementPosition.remove(req.params.id);

        req.flash(
            "success",
            "Position removed successfully."
        );

        res.redirect("/admin/arsp/members");

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to remove position."
        );

        res.redirect("/admin/arsp/members");

    }

};



// =====================================
// Save Position
// =====================================

exports.assignPosition = async (req, res) => {

    try {

        // Only one active Chief Adviser
        if (req.body.section === "Chief Adviser") {

            const chief =
                await ArspManagementPosition.getChiefAdviser();

            if (chief) {

                req.flash(
                    "error",
                    "A Chief Adviser already exists."
                );

                return res.redirect("/admin/arsp/members");

            }

        }


console.log("BODY:", req.body);
console.log("PARAMS:", req.params);


await ArspManagementPosition.remove(req.params.id);

await ArspManagementPosition.assign({

            member_id: req.params.id,

            committee_id: req.body.committee_id,

            section: req.body.section,

            designation: req.body.designation,

            region_id: req.body.region_id || null,

            display_order: req.body.display_order,

            appointed_at: new Date(),

            status: req.body.status

        });

        req.flash(
            "success",
            "Position assigned successfully."
        );

        res.redirect("/admin/arsp/members");

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Failed to assign position."
        );

        res.redirect("/admin/arsp/members");

    }

};


// =====================================
// Member Profile
// =====================================

exports.memberProfile = async (req, res) => {

    try {

        const member = await ArspMember.getById(req.params.id);

        if (!member) {

            req.flash("error","Member not found.");

            return res.redirect("/admin/arsp/members");

        }

        res.render(

            "admin/arsp/member-profile",

            {

                title:"Member Profile",

                member

            }

        );

    }

    catch(err){

        console.error(err);

        req.flash(

            "error",

            "Unable to load member."

        );

        res.redirect("/admin/arsp/members");

    }

};


// =====================================
// Admin Appointment Letter
// =====================================

exports.appointmentLetter = async (req, res) => {

    try {

        const setting =
            await ArspSetting.get();

        const member =
            await ArspMember.getById(
                req.params.id
            );

        if (!member) {

            req.flash(
                "error",
                "Member not found."
            );

            return res.redirect("/admin/arsp/members");

        }

        const position =
            await ArspManagementPosition.getByMemberId(
                member.id
            );

        if (!position) {

            req.flash(
                "error",
                "This member has not been assigned any appointment yet."
            );

            return res.redirect(`/admin/arsp/member/${member.id}`);

        }

        const documentNumber =
            `ARSP-APPT-${new Date(position.appointed_at).getFullYear()}-${member.member_id}`;

        let verification =
            await ArspDocumentVerification.getByDocumentNumber(
                documentNumber
            );

        if (!verification) {

            await ArspDocumentVerification.create({

                member_id: member.id,

                document_type: "Appointment Letter",

                document_number: documentNumber,

                issue_date: position.appointed_at,

                status: "Valid"

            });

        }

        const appointmentQR =
            await generateQRCode(

                documentNumber,

                `${req.protocol}://${req.get("host")}/arsp/document/verify/${documentNumber}`

            );

        res.render(

            "arsp-documents/appointment-letter",

            {

                title: "Appointment Letter",

                setting,

                member,

                position,

                documentNumber,

                appointmentQR

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to generate Appointment Letter."
        );

        res.redirect("/admin/arsp/members");

    }

};




// =====================================
// Edit Member Page
// =====================================

exports.editMemberPage = async (req, res) => {

    try {

        const member = await ArspMember.getById(req.params.id);

        if (!member) {

            req.flash("error", "Member not found.");

            return res.redirect("/admin/arsp/members");

        }

        res.render(

            "admin/arsp/register-member",

            {

                title: "Edit ARSP Member",

                member,
                isEdit: true

            }

        );

    } catch (err) {

        console.error(err);

        req.flash("error", "Unable to load member.");

        res.redirect("/admin/arsp/members");

    }

};


// =====================================
// Update Member
// =====================================

exports.updateMember = async (req, res) => {

    try {

        const member = await ArspMember.getById(req.params.id);

        if (!member) {

            req.flash(
                "error",
                "Member not found."
            );

            return res.redirect(
                "/admin/arsp/members"
            );
        }

        /*
         * Existing uploaded files are preserved.
         *
         * We NEVER delete the old physical files here.
         */

        const photo =
            req.files?.photo?.[0]?.filename ||
            member.photo ||
            "";

        const identityFront =
            req.files?.identity_front?.[0]?.filename ||
            member.identity_front ||
            "";

        const identityBack =
            req.files?.identity_back?.[0]?.filename ||
            member.identity_back ||
            "";

        await ArspMember.update(
            req.params.id,
            {

                full_name:
                    req.body.full_name,

                father_name:
                    req.body.father_name,

                mother_name:
                    req.body.mother_name,

                gender:
                    req.body.gender,

                dob:
                    req.body.dob || null,

                blood_group:
                    req.body.blood_group,

                occupation:
                    req.body.occupation,

                nationality:
                    req.body.nationality,

                identity_type:
                    req.body.identity_type || null,

                identity_number:
                    req.body.identity_number,

                identity_front:
                    identityFront,

                identity_back:
                    identityBack,

                mobile:
                    req.body.mobile,

                email:
                    req.body.email,

                address:
                    req.body.address,

                district:
                    req.body.district,

                state:
                    req.body.state,

                pincode:
                    req.body.pincode,

                emergency_contact_name:
                    req.body.emergency_contact_name,

                emergency_contact_relation:
                    req.body.emergency_contact_relation,

                emergency_contact_mobile:
                    req.body.emergency_contact_mobile,

                photo:
                    photo,

                joining_date:
                    req.body.joining_date || null,

                status:
                    req.body.status === "Inactive"
                        ? "Inactive"
                        : "Active"
            }
        );

        req.flash(
            "success",
            "Member updated successfully."
        );

        return res.redirect(
            "/admin/arsp/members"
        );

    } catch (err) {

        console.error(
            "ARSP Admin Update Member Error:",
            err
        );

        req.flash(
            "error",
            "Failed to update member."
        );

        return res.redirect(
            "/admin/arsp/members"
        );
    }
};

// =====================================
// Account Slip
// =====================================

exports.accountSlip = async (req, res) => {

    try {

        const ArspSetting =
            require("../models/ArspSetting");

        const member =
            await ArspMember.getById(
                req.params.id
            );

        if (!member) {

            req.flash(
                "error",
                "Member not found."
            );

            return res.redirect(
                "/admin/arsp/members"
            );

        }

        const setting =
            await ArspSetting.get();

        res.render(

            "arsp-documents/membership-registration-slip",

            {

                title:
                    "Membership Registration Slip",

                setting,

                member,

                username:
                    member.member_id,

                password:
                    "Already Changed",

                loginUrl:
                    `${req.protocol}://${req.get("host")}/arsp/login`,

                registrationSource:
                    "Registered by Admin"

            }

        );

    }

    catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to open Registration Slip."
        );

        res.redirect(
            "/admin/arsp/members"
        );

    }

};


// =====================================
// Toggle Status
// =====================================

exports.toggleStatus = async(req,res)=>{

    try{

        await ArspMember.toggleStatus(
            req.params.id
        );

        req.flash(

            "success",

            "Member status updated."

        );

    }

    catch(err){

        console.error(err);

    }

    res.redirect("/admin/arsp/members");

};


// =====================================
// Delete Member
// =====================================

exports.deleteMember = async (req, res) => {
    try {
        const deletedFiles = await ArspMember.remove(req.params.id);

        /*
         * Member registration uploads:
         *   public/uploads/arsp-members/
         *
         * Member QR:
         *   uploads/arsp-qr/<member_id>.png
         *
         * Appointment-letter QRs also use uploads/arsp-qr,
         * but their filenames are document numbers. Therefore
         * we delete ONLY the QR whose filename exactly matches
         * this member's member_id.
         */

        const memberUploadDir = path.resolve(
            __dirname,
            "../public/uploads/arsp-members"
        );

        const memberQrDir = path.resolve(
            __dirname,
            "../uploads/arsp-qr"
        );

        const registrationFiles = [
            "photo",
            "identity_front",
            "identity_back"
        ];

        for (const field of registrationFiles) {
            const filename = deletedFiles && deletedFiles[field];

            if (!filename || typeof filename !== "string") {
                continue;
            }

            const safeName = path.basename(filename);
            const filePath = path.resolve(
                memberUploadDir,
                safeName
            );

            if (
                filePath.startsWith(memberUploadDir + path.sep) &&
                fs.existsSync(filePath)
            ) {
                try {
                    fs.unlinkSync(filePath);
                } catch (fileErr) {
                    console.error(
                        `Unable to delete member ${field} file:`,
                        fileErr
                    );
                }
            }
        }

        /*
         * Delete the member QR only when the stored QR filename
         * corresponds exactly to this member's member_id.
         * This prevents appointment-letter QR files from being
         * accidentally deleted.
         */
        if (
            deletedFiles &&
            deletedFiles.member_id &&
            deletedFiles.qr_code
        ) {
            const expectedQrName =
                String(deletedFiles.member_id) + ".png";

            const storedQrName =
                path.basename(String(deletedFiles.qr_code));

            if (storedQrName === expectedQrName) {
                const qrPath = path.resolve(
                    memberQrDir,
                    expectedQrName
                );

                if (
                    qrPath.startsWith(memberQrDir + path.sep) &&
                    fs.existsSync(qrPath)
                ) {
                    try {
                        fs.unlinkSync(qrPath);
                    } catch (qrErr) {
                        console.error(
                            "Unable to delete member QR file:",
                            qrErr
                        );
                    }
                }
            }
        }

        req.flash(
            "success",
            "Member and all registration files deleted permanently."
        );

    } catch (err) {
        console.error("Delete Member Error:", err);

        req.flash(
            "error",
            "Unable to delete member."
        );
    }

    return res.redirect("/admin/arsp/members");
};


// ======================================
// Reset Password Page
// ======================================


exports.resetPasswordPage = async (req, res) => {

    try {

        const member = await ArspMember.getById(req.params.id);

        if (!member) {

            req.flash("error", "Member not found.");

            return res.redirect("/admin/arsp/members");

        }

        res.render(

            "admin/arsp/reset-password",

            {

                title: "Reset Password",

                member

            }

        );

    } catch (err) {

        console.error(err);

        res.redirect("/admin/arsp/members");

    }

};

// ======================================
// Reset Password
// ======================================

exports.resetPassword = async (req, res) => {

    try {

        const member = await ArspMember.getById(req.params.id);

        if (!member) {

            req.flash("error", "Member not found.");

            return res.redirect("/admin/arsp/members");

        }

       let password = "";

if (req.body.type === "auto") {

    password = member.mobile;

} else {

    const {

        new_password,

        confirm_password

    } = req.body;

    if (!new_password || !confirm_password) {

        req.flash(

            "error",

            "Please enter the password."

        );

        return res.redirect("back");

    }

    if (new_password !== confirm_password) {

        req.flash(

            "error",

            "Passwords do not match."

        );

        return res.redirect("back");

    }

    password = new_password;

}

        await ArspAccount.updatePasswordByMemberId(

            member.id,

            password

        );


      await ArspAccount.requirePasswordChange(
    member.id
);

       req.flash(
    "success",
    req.body.type === "auto"
        ? "Password has been reset to the member's registered mobile number. The member must change it after logging in."
        : "Password has been reset successfully."
);

        res.redirect("/admin/arsp/members");

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to reset password."

        );

        res.redirect("/admin/arsp/members");

    }

};








// =====================================
// Document Verification List
// =====================================

exports.documentVerifications = async (req, res) => {

    try {

        const documents =
            await ArspDocumentVerification.getAll();

        res.render(

            "admin/arsp/document-verifications",

            {

                title: "Document Verification",

                documents

            }

        );

    } catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to load document verifications."

        );

        res.redirect("/admin/arsp");

    }

};
