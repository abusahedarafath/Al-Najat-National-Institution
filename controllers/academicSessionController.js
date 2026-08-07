const AcademicSession = require("../models/AcademicSession");

// =======================================
// Show All Academic Sessions
// =======================================

exports.showSessions = async (req, res) => {
    try {

        const sessions = await AcademicSession.getAll();

        res.render("admin/academic-sessions", {
            title: "Academic Sessions",
            sessions
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// View Academic Session
// =======================================

exports.viewSession = async (req, res) => {
    try {

        const session = await AcademicSession.getById(req.params.id);

        if (!session) {
            return res.status(404).send("Academic Session not found");
        }

        res.render("admin/academic-session-details", {
            session
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Add Academic Session Page
// =======================================

exports.addSessionPage = (req, res) => {

    res.render("admin/add-academic-session");

};

// =======================================
// Create Academic Session
// =======================================

exports.createSession = async (req, res) => {
    try {

        const sessionData = {

            session_name: req.body.session_name,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            description: req.body.description,
            status: req.body.status || "Active"

        };

        await AcademicSession.create(sessionData);

        res.redirect("/admin/academic-sessions");

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Edit Academic Session Page
// =======================================

exports.editSessionPage = async (req, res) => {
    try {

        const session = await AcademicSession.getById(req.params.id);

        if (!session) {
            return res.status(404).send("Academic Session not found");
        }

        res.render("admin/edit-academic-session", {
            session
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Update Academic Session
// =======================================

exports.updateSession = async (req, res) => {
    try {

        const id = req.params.id;

        const sessionData = {

            session_name: req.body.session_name,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            description: req.body.description,
            status: req.body.status

        };

        await AcademicSession.update(id, sessionData);

        res.redirect("/admin/academic-session/" + id);

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};

// =======================================
// Delete Academic Session
// =======================================

exports.deleteSession = async (req, res) => {
    try {

        await AcademicSession.delete(req.params.id);

        res.redirect("/admin/academic-sessions");

    } catch (err) {

        console.error(err);
        res.status(500).send("Database Error");

    }
};
