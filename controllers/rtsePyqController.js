"use strict";

const RtsePyq = require("../models/RtsePyq");
const RtsePyqCategory = require("../models/RtsePyqCategory");

exports.index = async (req, res) => {
    try {
        const categories = await RtsePyqCategory.getAll(false);

        return res.render("rtse/pyq", {
            title: "RTSE Previous Year Questions",
            categories
        });
    } catch (err) {
        console.error("RTSE PYQ public index error:", err);
        return res.status(500).send(
            "Unable to load RTSE previous year questions."
        );
    }
};

exports.category = async (req, res) => {
    try {
        const year = Number.parseInt(req.params.year, 10);

        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            return res.status(404).render("errors/404");
        }

        const category = await RtsePyqCategory.getByYear(year);

        if (!category || !category.is_active) {
            return res.status(404).render("errors/404");
        }

        const pyqs = await RtsePyq.getByCategory(
            category.id,
            false
        );

        return res.render("rtse/pyq-category", {
            title: `${category.year} Previous Year Questions`,
            category,
            pyqs
        });
    } catch (err) {
        console.error("RTSE PYQ public category error:", err);
        return res.status(500).send(
            "Unable to load this year's RTSE question papers."
        );
    }
};
