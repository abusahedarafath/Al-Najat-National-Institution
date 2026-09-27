const RtsePyq = require("../models/RtsePyq");

exports.index = async (req, res) => {
    try {
        const pyqs = await RtsePyq.getAll(false);

        return res.render("rtse/pyq", {
            title: "RTSE Previous Year Questions",
            pyqs
        });
    } catch (err) {
        console.error("RTSE PYQ public error:", err);
        return res.status(500).send("Unable to load RTSE previous year questions.");
    }
};
