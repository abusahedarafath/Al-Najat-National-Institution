const About = require("../models/About");

exports.index = async (req, res) => {
    try {
        const sections = await About.getActive();

        res.render("about/index", {
            title: "About Us",
            sections
        });

    } catch (err) {
        console.error("About Page Error:", err);
        res.status(500).send("Internal Server Error");
    }
};
