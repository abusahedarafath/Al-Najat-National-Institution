const RtseHomepage = require("../models/RtseHomepage");
const RtseSetting = require("../models/RtseSetting");
const RtseExamSetting = require("../models/RtseExamSetting");

function parseJson(value, fallback) {
    try {
        if (!value) return fallback;
        return typeof value === "object" ? value : JSON.parse(value);
    } catch (_) {
        return fallback;
    }
}

exports.home = async (req, res) => {
    try {
        const [sections, setting, exam] = await Promise.all([
            RtseHomepage.getAll(false),
            RtseSetting.get(),
            RtseExamSetting.getActive()
        ]);

        const preparedSections = sections.map(section => ({
            ...section,
            contentData: parseJson(section.content, section.content || ""),
            settingsData: parseJson(section.settings, {})
        }));

        const sectionMap = {};
        preparedSections.forEach(section => {
            sectionMap[section.section_key] = section;
        });

        return res.render("rtse/home", {
            title: "RTSE 2026 | Ratabari Talent Search Examination",
            sections: preparedSections,
            sectionMap,
            setting,
            exam
        });
    } catch (err) {
        console.error("RTSE homepage error:", err);
        return res.status(500).send("Unable to load RTSE homepage.");
    }
};
