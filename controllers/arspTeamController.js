const ArspManagementPosition = require("../models/ArspManagementPosition");

// =====================================
// Complete ARSP Team
// =====================================

exports.team = async (req, res) => {

    try {

        const founders =
            await ArspManagementPosition.getFounder();

        const chiefAdviser =
            await ArspManagementPosition.getChiefAdviser();

        const organizingBody =
            await ArspManagementPosition.getOrganizingBody();

        const advisoryBody =
            await ArspManagementPosition.getAdvisoryBody();

        res.render("arsp/team", {

            title: "ARSP Management Team",

            founders,

            chiefAdviser,

            organizingBody,

            advisoryBody

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};

// =====================================
// Founder
// =====================================

exports.founder = async (req, res) => {

    try {

        const founders =
            await ArspManagementPosition.getFounder();

        res.render("arsp/founder", {

            title: "Founder",

            founders

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};

// =====================================
// Organizing Body
// =====================================

exports.organizingBody = async (req, res) => {

    try {

        const organizingBody =
            await ArspManagementPosition.getOrganizingBody();

        res.render("arsp/organizing-body", {

            title: "Organizing Body",

            organizingBody

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};

// =====================================
// Chief Adviser
// =====================================

exports.chiefAdviser = async (req, res) => {

    try {

        const chiefAdviser =
            await ArspManagementPosition.getChiefAdviser();

        res.render("arsp/chief-adviser", {

            title: "Chief Adviser",

            chiefAdviser

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};

// =====================================
// Advisory Body
// =====================================

exports.advisoryBody = async (req, res) => {

    try {

        const advisoryBody =
            await ArspManagementPosition.getAdvisoryBody();

        res.render("arsp/advisory-body", {

            title: "Advisory Body",

            advisoryBody

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};
