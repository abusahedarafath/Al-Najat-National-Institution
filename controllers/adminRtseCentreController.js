const RtseCentre = require("../models/RtseCentre");
const RtseCentreAccount = require("../models/RtseCentreAccount");

const renderError = (req, res, redirectPath, message) => {
    if (req.flash) req.flash("error", message);
    return res.redirect(redirectPath);
};

// =====================================
// Centre Registry
// =====================================
exports.index = async (req, res) => {
    try {
        const centres = await RtseCentre.getAll();
        const stats = await RtseCentre.getStats();

        return res.render("admin/arsp/centres/index", {
            title: "RTSE Centre Registry",
            centres,
            stats
        });
    } catch (err) {
        console.error("RTSE Centre Registry Error:", err);
        return renderError(
            req,
            res,
            "/admin/arsp/centres",
            "Unable to load Centre Registry."
        );
    }
};

// =====================================
// Add Centre Page
// =====================================
exports.addPage = (req, res) => {
    return res.render("admin/arsp/centres/form", {
        title: "Add RTSE Centre",
        centre: null,
        mode: "create"
    });
};

// =====================================
// Create Centre
// =====================================
exports.create = async (req, res) => {
    try {
        const {
            centre_name,
            centre_type,
            head_name,
            mobile,
            email,
            address,
            village,
            post_office,
            district,
            state,
            pincode,
            capacity,
            remarks
        } = req.body;

        if (!centre_name || !String(centre_name).trim()) {
            return renderError(
                req,
                res,
                "/admin/arsp/centres/add",
                "Centre name is required."
            );
        }

        const createdCentre = await RtseCentre.create({
            centre_name: String(centre_name).trim(),
            centre_type,
            head_name,
            mobile,
            email,
            address,
            village,
            post_office,
            district,
            state,
            pincode,
            capacity,
            remarks,
            created_by: req.session?.user?.id || null
        });

        if (req.flash) {
            req.flash(
                "success",
                `Centre created successfully. Centre ID: ${createdCentre.centre_id}, Centre Code: ${createdCentre.centre_code}.`
            );
        }

        return res.redirect(`/admin/arsp/centre/${createdCentre.id}`);
    } catch (err) {
        console.error("RTSE Centre Create Error:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return renderError(
                req,
                res,
                "/admin/arsp/centres/add",
                "Unable to create centre because a unique value conflict occurred."
            );
        }

        return renderError(
            req,
            res,
            "/admin/arsp/centres/add",
            "Unable to create centre."
        );
    }
};

// =====================================
// View Centre
// =====================================
exports.view = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).send("Invalid centre ID.");
        }

        const centre = await RtseCentre.getById(id);

        if (!centre) {
            return res.status(404).send("Centre not found.");
        }

        const assignedSchools = await RtseCentre.getAssignedSchools(id);
        const centreAccount = await RtseCentreAccount.getByCentreId(id);

        return res.render("admin/arsp/centres/view", {
            title: "RTSE Centre Details",
            centre,
            assignedSchools,
            centreAccount
        });
    } catch (err) {
        console.error("RTSE Centre View Error:", err);
        return res.status(500).send("Unable to load centre.");
    }
};

// =====================================
// Edit Centre Page
// =====================================
exports.editPage = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).send("Invalid centre ID.");
        }

        const centre = await RtseCentre.getById(id);

        if (!centre) {
            return res.status(404).send("Centre not found.");
        }

        return res.render("admin/arsp/centres/form", {
            title: "Edit RTSE Centre",
            centre,
            mode: "edit"
        });
    } catch (err) {
        console.error("RTSE Centre Edit Page Error:", err);
        return res.status(500).send("Unable to load centre.");
    }
};

// =====================================
// Update Centre
// =====================================
exports.update = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).send("Invalid centre ID.");
        }

        const {
            centre_code,
            centre_name,
            centre_type,
            head_name,
            mobile,
            email,
            address,
            village,
            post_office,
            district,
            state,
            pincode,
            capacity,
            remarks
        } = req.body;

        if (!centre_code || !centre_name) {
            return renderError(
                req,
                res,
                `/admin/arsp/centre/${id}/edit`,
                "Centre code and centre name are required."
            );
        }

        const updated = await RtseCentre.update(id, {
            centre_code: String(centre_code).trim(),
            centre_name: String(centre_name).trim(),
            centre_type,
            head_name,
            mobile,
            email,
            address,
            village,
            post_office,
            district,
            state,
            pincode,
            capacity,
            remarks
        });

        if (!updated) {
            return res.status(404).send("Centre not found.");
        }

        if (req.flash) {
            req.flash("success", "Centre updated successfully.");
        }

        return res.redirect(`/admin/arsp/centre/${id}`);
    } catch (err) {
        console.error("RTSE Centre Update Error:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return renderError(
                req,
                res,
                `/admin/arsp/centre/${req.params.id}/edit`,
                "Centre code already exists."
            );
        }

        return renderError(
            req,
            res,
            `/admin/arsp/centre/${req.params.id}/edit`,
            "Unable to update centre."
        );
    }
};

// =====================================
// Approve Centre
// =====================================
exports.approve = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await RtseCentre.updateStatus(
            id,
            "Approved",
            req.session?.user?.id || null
        );

        if (req.flash) {
            req.flash("success", "Centre approved successfully.");
        }

        return res.redirect(`/admin/arsp/centre/${id}`);
    } catch (err) {
        console.error("RTSE Centre Approval Error:", err);
        return renderError(
            req,
            res,
            `/admin/arsp/centre/${req.params.id}`,
            "Unable to approve centre."
        );
    }
};

// =====================================
// Reject Centre
// =====================================
exports.reject = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await RtseCentre.updateStatus(
            id,
            "Rejected",
            req.session?.user?.id || null,
            req.body.remarks || null
        );

        if (req.flash) {
            req.flash("success", "Centre rejected.");
        }

        return res.redirect(`/admin/arsp/centre/${id}`);
    } catch (err) {
        console.error("RTSE Centre Rejection Error:", err);
        return renderError(
            req,
            res,
            `/admin/arsp/centre/${req.params.id}`,
            "Unable to reject centre."
        );
    }
};

// =====================================
// View School Assignment
// =====================================
exports.viewSchoolAssignment = async (req, res) => {
    try {
        const centreId = Number(req.params.id);
        const assignmentId = Number(req.params.assignmentId);

        if (
            !Number.isInteger(centreId) ||
            centreId <= 0 ||
            !Number.isInteger(assignmentId) ||
            assignmentId <= 0
        ) {
            return res.status(400).send("Invalid centre or assignment ID.");
        }

        const assignment = await RtseCentre.getCentreAssignment(
            centreId,
            assignmentId
        );

        if (!assignment) {
            return res.status(404).send(
                "School assignment not found for this centre."
            );
        }

        return res.redirect(
            `/admin/arsp/school/${assignment.school_id}`
        );
    } catch (err) {
        console.error(
            "Centre School Assignment View Error:",
            err
        );

        return res.status(500).send(
            "Unable to load school assignment."
        );
    }
};


// =====================================
// Approve School-Centre Assignment
// =====================================
exports.approveSchoolAssignment = async (req, res) => {
    try {
        const centreId = Number(req.params.id);
        const assignmentId = Number(req.params.assignmentId);

        if (
            !Number.isInteger(centreId) ||
            centreId <= 0 ||
            !Number.isInteger(assignmentId) ||
            assignmentId <= 0
        ) {
            return res.status(400).send(
                "Invalid centre or assignment ID."
            );
        }

        const assignment =
            await RtseCentre.getCentreAssignment(
                centreId,
                assignmentId
            );

        if (!assignment) {
            req.flash(
                "error",
                "School assignment was not found under this centre."
            );

            return res.redirect(
                `/admin/arsp/centre/${centreId}`
            );
        }

        if (assignment.assignment_status === "Approved") {
            req.flash(
                "info",
                "This school assignment is already approved."
            );

            return res.redirect(
                `/admin/arsp/centre/${centreId}`
            );
        }

        await RtseCentre.updateAssignmentStatus(
            assignmentId,
            "Approved",
            req.session?.user?.id || null,
            "School assignment approved by administrator."
        );

        req.flash(
            "success",
            `${assignment.school_name} has been approved for ${assignment.centre_name}.`
        );

        return res.redirect(
            `/admin/arsp/centre/${centreId}`
        );
    } catch (err) {
        console.error(
            "Centre School Assignment Approval Error:",
            err
        );

        req.flash(
            "error",
            "Unable to approve school assignment."
        );

        return res.redirect(
            `/admin/arsp/centre/${req.params.id}`
        );
    }
};


// =====================================
// Reject School-Centre Assignment
// =====================================
exports.rejectSchoolAssignment = async (req, res) => {
    try {
        const centreId = Number(req.params.id);
        const assignmentId = Number(req.params.assignmentId);

        if (
            !Number.isInteger(centreId) ||
            centreId <= 0 ||
            !Number.isInteger(assignmentId) ||
            assignmentId <= 0
        ) {
            return res.status(400).send(
                "Invalid centre or assignment ID."
            );
        }

        const assignment =
            await RtseCentre.getCentreAssignment(
                centreId,
                assignmentId
            );

        if (!assignment) {
            req.flash(
                "error",
                "School assignment was not found under this centre."
            );

            return res.redirect(
                `/admin/arsp/centre/${centreId}`
            );
        }

        await RtseCentre.updateAssignmentStatus(
            assignmentId,
            "Rejected",
            req.session?.user?.id || null,
            req.body.remarks ||
                "School assignment rejected by administrator."
        );

        req.flash(
            "success",
            `${assignment.school_name} has been rejected for ${assignment.centre_name}.`
        );

        return res.redirect(
            `/admin/arsp/centre/${centreId}`
        );
    } catch (err) {
        console.error(
            "Centre School Assignment Rejection Error:",
            err
        );

        req.flash(
            "error",
            "Unable to reject school assignment."
        );

        return res.redirect(
            `/admin/arsp/centre/${req.params.id}`
        );
    }
};


// =====================================
// Deactivate Centre
// =====================================
exports.deactivate = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await RtseCentre.updateStatus(id, "Inactive");

        if (req.flash) {
            req.flash("success", "Centre deactivated.");
        }

        return res.redirect(`/admin/arsp/centre/${id}`);
    } catch (err) {
        console.error("RTSE Centre Deactivation Error:", err);
        return renderError(
            req,
            res,
            `/admin/arsp/centre/${req.params.id}`,
            "Unable to deactivate centre."
        );
    }
};

// =====================================
// Activate Centre
// =====================================
exports.activate = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await RtseCentre.updateStatus(id, "Approved");

        if (req.flash) {
            req.flash("success", "Centre activated successfully.");
        }

        return res.redirect(`/admin/arsp/centre/${id}`);
    } catch (err) {
        console.error("RTSE Centre Activation Error:", err);
        return renderError(
            req,
            res,
            `/admin/arsp/centre/${req.params.id}`,
            "Unable to activate centre."
        );
    }
};

// =====================================
// Suspend Centre
// =====================================
exports.suspend = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await RtseCentre.updateStatus(id, "Suspended");

        if (req.flash) {
            req.flash("success", "Centre suspended.");
        }

        return res.redirect(`/admin/arsp/centre/${id}`);
    } catch (err) {
        console.error("RTSE Centre Suspension Error:", err);
        return renderError(
            req,
            res,
            `/admin/arsp/centre/${req.params.id}`,
            "Unable to suspend centre."
        );
    }
};



// =====================================
// Create Centre Portal Account
// =====================================
exports.createAccount = async (req, res) => {
    const id = Number(req.params.id);

    try {
        const centre = await RtseCentre.getById(id);

        if (!centre) {
            return res.status(404).send("Centre not found.");
        }

        if (centre.status !== "Approved") {
            req.flash(
                "error",
                "Only an approved centre can receive a portal account."
            );
            return res.redirect(`/admin/arsp/centre/${id}`);
        }

        const existing = await RtseCentreAccount.getByCentreId(id);

        if (existing) {
            req.flash(
                "error",
                "This centre already has a portal account."
            );
            return res.redirect(`/admin/arsp/centre/${id}`);
        }

        const username = `centre_${String(centre.centre_code).trim()}`;

        const created = await RtseCentreAccount.create(
            id,
            username
        );

        req.flash(
            "success",
            `Centre Portal account created. Username: ${created.username} | Temporary Password: ${created.temporaryPassword}`
        );

        return res.redirect(`/admin/arsp/centre/${id}`);

    } catch (err) {
        console.error(
            "RTSE Centre Account Create Error:",
            err
        );

        req.flash(
            "error",
            err.message || "Unable to create Centre Portal account."
        );

        return res.redirect(`/admin/arsp/centre/${id}`);
    }
};

// =====================================
// Reset Centre Portal Password
// =====================================
exports.resetAccountPassword = async (req, res) => {
    const id = Number(req.params.id);

    try {
        const centre = await RtseCentre.getById(id);

        if (!centre) {
            return res.status(404).send("Centre not found.");
        }

        const credentials =
            await RtseCentreAccount.resetPassword(id);

        if (!credentials) {
            req.flash(
                "error",
                "Centre Portal account does not exist."
            );

            return res.redirect(`/admin/arsp/centre/${id}`);
        }

        // Store the newly generated credentials temporarily
        // so the admin can view and download the credential slip.
        req.session.arspCentreCredentialSlip = {
            centre_id: centre.id,
            username: credentials.username,
            temporaryPassword: credentials.temporaryPassword,
            generatedAt: new Date().toISOString()
        };

        req.flash(
            "success",
            "Centre Portal password reset successfully."
        );

        return res.redirect(
            `/admin/arsp/centre/${centre.id}/credential-slip`
        );

    } catch (err) {
        console.error(
            "RTSE Centre Account Password Reset Error:",
            err
        );

        req.flash(
            "error",
            "Unable to reset Centre Portal password."
        );

        return res.redirect(`/admin/arsp/centre/${id}`);
    }
};

// =====================================
// Centre Portal Credential Slip
// =====================================
exports.credentialSlip = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).send("Invalid centre ID.");
        }

        const centre = await RtseCentre.getById(id);

        if (!centre) {
            delete req.session.arspCentreCredentialSlip;
            return res.status(404).render("errors/404");
        }

        const slip = req.session.arspCentreCredentialSlip;

        if (
            !slip ||
            Number(slip.centre_id) !== Number(centre.id) ||
            !slip.username ||
            !slip.temporaryPassword
        ) {
            return res.redirect(
                `/admin/arsp/centre/${centre.id}`
            );
        }

        return res.render(
            "admin/arsp/centres/credential-slip",
            {
                title: "Centre Portal Credential Slip",
                centre,
                credentials: {
                    username: slip.username,
                    temporaryPassword: slip.temporaryPassword
                },
                portalUrl:
                    `${req.protocol}://${req.get("host")}/rtse/centre/login`
            }
        );

    } catch (err) {
        console.error(
            "RTSE Centre Credential Slip Error:",
            err
        );

        return res.status(500).send(
            "Unable to load Centre credential slip."
        );
    }
};

// =====================================
// Close Centre Credential Slip
// =====================================
exports.closeCredentialSlip = (req, res) => {
    delete req.session.arspCentreCredentialSlip;

    return req.session.save((err) => {
        if (err) {
            console.error(
                "RTSE Centre Credential Slip Session Clear Error:",
                err
            );
        }

        return res.redirect(
            `/admin/arsp/centre/${req.params.id}`
        );
    });
};

// =====================================
// Activate Centre Portal Account
// =====================================
exports.activateAccount = async (req, res) => {
    const id = Number(req.params.id);

    try {
        await RtseCentreAccount.activate(id);

        req.flash(
            "success",
            "Centre Portal account activated."
        );

    } catch (err) {
        console.error(
            "RTSE Centre Account Activate Error:",
            err
        );

        req.flash(
            "error",
            "Unable to activate Centre Portal account."
        );
    }

    return res.redirect(`/admin/arsp/centre/${id}`);
};

// =====================================
// Deactivate Centre Portal Account
// =====================================
exports.deactivateAccount = async (req, res) => {
    const id = Number(req.params.id);

    try {
        await RtseCentreAccount.deactivate(id);

        req.flash(
            "success",
            "Centre Portal account deactivated."
        );

    } catch (err) {
        console.error(
            "RTSE Centre Account Deactivate Error:",
            err
        );

        req.flash(
            "error",
            "Unable to deactivate Centre Portal account."
        );
    }

    return res.redirect(`/admin/arsp/centre/${id}`);
};

// =====================================
// Suspend Centre Portal Account
// =====================================
exports.suspendAccount = async (req, res) => {
    const id = Number(req.params.id);

    try {
        await RtseCentreAccount.suspend(id);

        req.flash(
            "success",
            "Centre Portal account suspended."
        );

    } catch (err) {
        console.error(
            "RTSE Centre Account Suspend Error:",
            err
        );

        req.flash(
            "error",
            "Unable to suspend Centre Portal account."
        );
    }

    return res.redirect(`/admin/arsp/centre/${id}`);
};


module.exports = exports;
