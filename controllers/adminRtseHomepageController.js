const RtseHomepage = require("../models/RtseHomepage");

function parseJson(value, fallback) {
    try {
        if (!value) return fallback;
        return typeof value === "object" ? value : JSON.parse(value);
    } catch (_) {
        return fallback;
    }
}

function clean(value) {
    return typeof value === "string" ? value.trim() : "";
}

function collectItems(body, prefix, fields) {
    const items = [];
    let i = 0;

    while (true) {
        const exists = body[`${prefix}_${i}_title`] !== undefined ||
            body[`${prefix}_${i}_question`] !== undefined ||
            body[`${prefix}_${i}_number`] !== undefined;

        if (!exists) break;

        const item = {};

        fields.forEach(field => {
            const value = clean(body[`${prefix}_${i}_${field}`]);
            if (value !== "") item[field] = value;
        });

        if (Object.keys(item).length) items.push(item);
        i++;
    }

    return items;
}

function buildSectionData(section, body) {
    const key = section.section_key;

    if (key === "hero") {
        return {
            content: clean(body.description),
            settings: {
                badge: clean(body.badge),
                primary_label: clean(body.primary_label),
                primary_url: clean(body.primary_url),
                secondary_label: clean(body.secondary_label),
                secondary_url: clean(body.secondary_url),
                image: clean(body.image)
            }
        };
    }

    if (key === "announcement") {
        return {
            content: clean(body.message),
            settings: {
                button_label: clean(body.button_label),
                button_url: clean(body.button_url)
            }
        };
    }

    if (key === "quick_services") {
        return {
            content: collectItems(body, "service", [
                "icon",
                "title",
                "description",
                "url"
            ]),
            settings: {}
        };
    }

    if (key === "why_rtse") {
        return {
            content: collectItems(body, "card", [
                "title",
                "description"
            ]),
            settings: {}
        };
    }

    if (key === "how_it_works") {
        return {
            content: collectItems(body, "step", [
                "number",
                "title",
                "description"
            ]),
            settings: {}
        };
    }

    if (key === "cta") {
        return {
            content: clean(body.description),
            settings: {
                primary_label: clean(body.primary_label),
                primary_url: clean(body.primary_url),
                secondary_label: clean(body.secondary_label),
                secondary_url: clean(body.secondary_url)
            }
        };
    }

    if (key === "faq") {
        const items = [];
        let i = 0;

        while (body[`faq_${i}_question`] !== undefined) {
            const question = clean(body[`faq_${i}_question`]);
            const answer = clean(body[`faq_${i}_answer`]);

            if (question || answer) {
                items.push({ question, answer });
            }

            i++;
        }

        return {
            content: items,
            settings: {}
        };
    }

    return {
        content: clean(body.content),
        settings: parseJson(body.settings, {})
    };
}

exports.index = async (req, res) => {
    try {
        const sections = await RtseHomepage.getAll(true);

        const preparedSections = sections.map(section => ({
            ...section,
            contentData: parseJson(section.content, section.content || ""),
            settingsData: parseJson(section.settings, {})
        }));

        return res.render("admin/rtse/homepage", {
            title: "RTSE Homepage Management",
            sections: preparedSections,
            saved: req.query.saved === "1"
        });
    } catch (err) {
        console.error("RTSE homepage admin index error:", err);
        return res.status(500).send("Unable to load RTSE homepage management.");
    }
};

exports.update = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).send("Invalid homepage section.");
        }

        const section = await RtseHomepage.getById(id);

        if (!section) {
            return res.status(404).send("Homepage section not found.");
        }

        const data = buildSectionData(section, req.body);

        await RtseHomepage.update(id, {
            title: clean(req.body.title),
            subtitle: clean(req.body.subtitle),
            content: typeof data.content === "string"
                ? data.content
                : JSON.stringify(data.content),
            settings: JSON.stringify(data.settings),
            display_order: req.body.display_order,
            is_active: req.body.is_active
        });

        return res.redirect("/admin/rtse/homepage?saved=1");
    } catch (err) {
        console.error("RTSE homepage update error:", err);
        return res.status(500).send("Unable to update RTSE homepage section.");
    }
};

exports.toggle = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).send("Invalid homepage section.");
        }

        const active = Number(req.body.is_active) === 1;

        await RtseHomepage.setActive(id, active);

        return res.redirect("/admin/rtse/homepage?saved=1");
    } catch (err) {
        console.error("RTSE homepage toggle error:", err);
        return res.status(500).send("Unable to update homepage visibility.");
    }
};
