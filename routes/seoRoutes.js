const express = require("express");
const router = express.Router();

const SITE_URL = "https://arsp.co.in";

// =====================================================
// ROBOTS.TXT
// =====================================================

router.get("/robots.txt", (req, res) => {
    res.type("text/plain");

    res.send(`User-agent: *
Allow: /

Disallow: /admin
Disallow: /student
Disallow: /arsp/dashboard
Disallow: /arsp/change-password
Disallow: /arsp/forgot-password
Disallow: /arsp/activity
Disallow: /arsp/id-card
Disallow: /arsp/registration-slip
Disallow: /arsp/appointment-letter

Disallow: /rtse/review
Disallow: /rtse/edit
Disallow: /rtse/confirm

Sitemap: ${SITE_URL}/sitemap.xml
`);
});

// =====================================================
// SITEMAP.XML
// =====================================================

router.get("/sitemap.xml", (req, res) => {

    const urls = [

        // =========================
        // MAIN WEBSITE
        // =========================

        "/",
        "/about",
        "/chairman-message",
        "/principal-message",
        "/chancellor-message",
        "/admission",
        "/gallery",
        "/news",
        "/notice",

        // =========================
        // ARSP PUBLIC PAGES
        // =========================

        "/arsp/register",
        "/arsp/team",
        "/arsp/founder",
        "/arsp/organizing-body",
        "/arsp/chief-adviser",
        "/arsp/advisory-body",

        // =========================
        // HONOUR HEART
        // =========================

        "/honour-heart",
        "/honour-heart/legends",

        // =========================
        // RTSE PUBLIC PAGES
        // =========================

        "/rtse",
        "/rtse/apply",
        "/rtse/registration-slip",
        "/rtse/result",
        "/rtse/certificate"
    ];

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const xmlUrls = urls.map((url) => {

        const priority =
            url === "/" ? "1.0" :
            url === "/about" ? "0.9" :
            url === "/arsp/team" ? "0.8" :
            url === "/honour-heart" ? "0.8" :
            url === "/rtse" ? "0.9" :
            "0.7";

        const changefreq =
            url === "/" ? "weekly" :
            url === "/news" ? "daily" :
            url === "/notice" ? "daily" :
            "monthly";

        return `
    <url>
        <loc>${SITE_URL}${url}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

    res.type("application/xml");
    res.send(xml);
});

module.exports = router;
