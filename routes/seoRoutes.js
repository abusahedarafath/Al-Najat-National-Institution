const express = require("express");
const router = express.Router();

const SITE_URL = "https://arsp.co.in";


// =====================================================
// SEO PAGE DATA
// =====================================================

const pages = {

    arsp: {
        title: "ARSP | Active Rural Social Progress | Ratabari, Assam",
        description:
            "ARSP stands for Active Rural Social Progress, a social development organization working in education, student empowerment, rural development and community initiatives in Ratabari, Assam.",
        canonical: "/arsp",
        eyebrow: "ARSP",
        heading: "Active Rural Social Progress (ARSP)",
        intro:
            "Active Rural Social Progress (ARSP) is a social development organization associated with education, student empowerment, rural development and community initiatives in Ratabari, Assam.",
        primaryUrl: "/",
        primaryLabel: "Visit Official Website",
        sections: [
            {
                heading: "What does ARSP stand for?",
                paragraphs: [
                    "ARSP stands for Active Rural Social Progress. The organization focuses on initiatives connected with education, students, social development and community progress."
                ],
                links: [
                    {
                        title: "Active Rural Social Progress",
                        url: "/active-rural-social-progress",
                        description: "Learn about the organization and its identity."
                    },
                    {
                        title: "RTSE",
                        url: "/rtse",
                        description: "Ratabari Talent Search Examination."
                    },
                    {
                        title: "HONOUR HEART Award",
                        url: "/honour-heart",
                        description: "Official award and recognition programme."
                    }
                ]
            }
        ]
    },


    "active-rural-social-progress": {
        title: "Active Rural Social Progress | ARSP Official",
        description:
            "Active Rural Social Progress (ARSP) is a social development organization in Ratabari, Assam, working in education, student empowerment, rural development and community initiatives.",
        canonical: "/active-rural-social-progress",
        eyebrow: "ARSP",
        heading: "Active Rural Social Progress",
        intro:
            "Active Rural Social Progress, commonly known as ARSP, works around education, student empowerment, rural development and community-oriented initiatives.",
        primaryUrl: "/arsp",
        primaryLabel: "Explore ARSP",
        sections: [
            {
                heading: "Active Rural Social Progress and ARSP",
                paragraphs: [
                    "Active Rural Social Progress is the full organizational name represented by the abbreviation ARSP. The official website provides information about ARSP programmes, initiatives and public activities."
                ],
                links: [
                    {
                        title: "ARSP",
                        url: "/arsp",
                        description: "The official ARSP identity page."
                    },
                    {
                        title: "All Ratabari Student Parishad",
                        url: "/all-ratabari-student-parishad",
                        description: "Student-focused organizational identity."
                    },
                    {
                        title: "All Ratabari Student Power",
                        url: "/all-ratabari-student-power",
                        description: "Student empowerment identity."
                    }
                ]
            }
        ]
    },


    "all-ratabari-student-parishad": {
        title: "All Ratabari Student Parishad | ARSP",
        description:
            "All Ratabari Student Parishad, associated with ARSP, represents a student-focused identity connected with education, student participation and community development in Ratabari.",
        canonical: "/all-ratabari-student-parishad",
        eyebrow: "ARSP",
        heading: "All Ratabari Student Parishad",
        intro:
            "All Ratabari Student Parishad is a student-focused identity associated with the wider ARSP initiative and its emphasis on education, participation and student empowerment.",
        primaryUrl: "/arsp",
        primaryLabel: "Explore ARSP",
        sections: [
            {
                heading: "Student-focused initiatives",
                paragraphs: [
                    "The student-focused activities represented through this identity are connected with education, awareness, participation and opportunities for students."
                ],
                links: [
                    {
                        title: "RTSE",
                        url: "/rtse",
                        description: "Ratabari Talent Search Examination."
                    },
                    {
                        title: "ARSP",
                        url: "/arsp",
                        description: "Active Rural Social Progress."
                    }
                ]
            }
        ]
    },


    "all-ratabari-student-power": {
        title: "All Ratabari Student Power | ARSP",
        description:
            "All Ratabari Student Power is a student empowerment identity associated with ARSP and its education and community initiatives in Ratabari.",
        canonical: "/all-ratabari-student-power",
        eyebrow: "ARSP",
        heading: "All Ratabari Student Power",
        intro:
            "All Ratabari Student Power represents a student empowerment identity connected with education, participation and community development.",
        primaryUrl: "/arsp",
        primaryLabel: "Explore ARSP",
        sections: [
            {
                heading: "Student empowerment",
                paragraphs: [
                    "Student empowerment is an important part of education and community development. This identity connects students with educational and community-oriented initiatives."
                ],
                links: [
                    {
                        title: "Active Rural Social Progress",
                        url: "/active-rural-social-progress",
                        description: "The full ARSP organizational identity."
                    },
                    {
                        title: "RTSE 2026",
                        url: "/rtse-2026",
                        description: "The 2026 Ratabari Talent Search Examination."
                    }
                ]
            }
        ]
    },


    rtse: {
        title: "RTSE | Ratabari Talent Search Examination",
        description:
            "RTSE stands for Ratabari Talent Search Examination, an examination initiative for students. Find RTSE information, applications, results, certificates and verification.",
        canonical: "/rtse",
        eyebrow: "RTSE",
        heading: "Ratabari Talent Search Examination (RTSE)",
        intro:
            "RTSE stands for Ratabari Talent Search Examination. This official portal provides information and access to the RTSE examination system.",
        primaryUrl: "/rtse/apply",
        primaryLabel: "RTSE Online Application",
        sections: [
            {
                heading: "RTSE — Ratabari Talent Search Examination",
                paragraphs: [
                    "Ratabari Talent Search Examination is commonly abbreviated as RTSE. The official RTSE portal provides access to examination applications and public services.",
                    "For the 2026 examination, candidates can use the official application, registration, result, certificate and verification services available through the RTSE portal."
                ],
                links: [
                    {
                        title: "RTSE 2026",
                        url: "/rtse-2026",
                        description: "Information about the 2026 examination."
                    },
                    {
                        title: "Apply for RTSE",
                        url: "/rtse/apply",
                        description: "Open the RTSE application portal."
                    },
                    {
                        title: "RTSE Result",
                        url: "/rtse/result",
                        description: "Access the public result portal."
                    },
                    {
                        title: "RTSE Certificate",
                        url: "/rtse/certificate",
                        description: "Access the certificate portal."
                    }
                ]
            }
        ]
    },


    "rtse-2026": {
        title: "RTSE 2026 | Ratabari Talent Search Examination 2026",
        description:
            "RTSE 2026, the Ratabari Talent Search Examination 2026. Access official examination information, online application, results, certificates and verification.",
        canonical: "/rtse-2026",
        eyebrow: "RTSE 2026",
        heading: "RTSE 2026 — Ratabari Talent Search Examination",
        intro:
            "RTSE 2026 refers to the 2026 edition of the Ratabari Talent Search Examination. This page connects the RTSE 26 search term with the official examination portal.",
        primaryUrl: "/rtse/apply",
        primaryLabel: "Open RTSE Application",
        sections: [
            {
                heading: "RTSE 26 and RTSE 2026",
                paragraphs: [
                    "RTSE 26 is another commonly used short form for RTSE 2026. Both terms refer to the 2026 Ratabari Talent Search Examination.",
                    "Candidates should use the official RTSE portal for application, registration, result, certificate and verification services."
                ],
                links: [
                    {
                        title: "RTSE",
                        url: "/rtse",
                        description: "Main RTSE information page."
                    },
                    {
                        title: "RTSE Application",
                        url: "/rtse/apply",
                        description: "Official online application."
                    },
                    {
                        title: "Registration Verification",
                        url: "/rtse/registration-slip",
                        description: "RTSE registration slip service."
                    },
                    {
                        title: "Result Portal",
                        url: "/rtse/result",
                        description: "Check RTSE results."
                    },
                    {
                        title: "Certificate Portal",
                        url: "/rtse/certificate",
                        description: "Access RTSE certificate services."
                    }
                ]
            }
        ]
    },


    "ratabari-talent-search-examination": {
        title: "Ratabari Talent Search Examination | RTSE 2026",
        description:
            "Ratabari Talent Search Examination (RTSE) 2026 official information, application, result, certificate and verification portal.",
        canonical: "/ratabari-talent-search-examination",
        eyebrow: "RTSE",
        heading: "Ratabari Talent Search Examination",
        intro:
            "Ratabari Talent Search Examination, abbreviated as RTSE, is the official examination identity used for the RTSE student examination programme.",
        primaryUrl: "/rtse",
        primaryLabel: "Visit RTSE Portal",
        sections: [
            {
                heading: "Ratabari Talent Search Examination (RTSE)",
                paragraphs: [
                    "The full name Ratabari Talent Search Examination is associated with the abbreviation RTSE. The official website provides the examination's public online services.",
                    "For the 2026 edition, candidates can access the official RTSE application and other public examination services."
                ],
                links: [
                    {
                        title: "RTSE 2026",
                        url: "/rtse-2026",
                        description: "2026 examination information."
                    },
                    {
                        title: "Apply Online",
                        url: "/rtse/apply",
                        description: "Official RTSE application portal."
                    },
                    {
                        title: "Results",
                        url: "/rtse/result",
                        description: "Official RTSE result portal."
                    }
                ]
            }
        ]
    }

};


// =====================================================
// JSON-LD BUILDER
// =====================================================

function buildPageSchema(page, slug) {

    const canonicalUrl = `${SITE_URL}${page.canonical}`;

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": `${canonicalUrl}#webpage`,
                "url": canonicalUrl,
                "name": page.title,
                "description": page.description,
                "isPartOf": {
                    "@id": `${SITE_URL}/#website`
                },
                "about": {
                    "@id": `${SITE_URL}/#organization`
                }
            },
            {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                "name": "Active Rural Social Progress",
                "alternateName": [
                    "ARSP",
                    "All Ratabari Student Parishad",
                    "All Ratabari Student Power"
                ],
                "url": `${SITE_URL}/`
            },
            {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                "url": `${SITE_URL}/`,
                "name": "Active Rural Social Progress",
                "alternateName": "ARSP"
            }
        ]
    };
}


// =====================================================
// SEO LANDING PAGES
// =====================================================

function renderSeoPage(slug, req, res) {

    const page = pages[slug];

    if (!page) {
        return res.status(404).render("errors/404");
    }

    return res.render("seo/identity", {
        title: page.title,
        metaDescription: page.description,
        canonicalPath: page.canonical,
        eyebrow: page.eyebrow,
        heading: page.heading,
        intro: page.intro,
        primaryUrl: page.primaryUrl,
        primaryLabel: page.primaryLabel,
        sections: page.sections,
        seoSchema: buildPageSchema(page, slug)
    });
}


// =====================================================
// SEO URLS
// =====================================================

// ARSP
router.get("/arsp", (req, res) =>
    renderSeoPage("arsp", req, res)
);

router.get("/active-rural-social-progress", (req, res) =>
    renderSeoPage("active-rural-social-progress", req, res)
);

router.get("/all-ratabari-student-parishad", (req, res) =>
    renderSeoPage("all-ratabari-student-parishad", req, res)
);

router.get("/all-ratabari-student-power", (req, res) =>
    renderSeoPage("all-ratabari-student-power", req, res)
);


// RTSE

router.get("/rtse-2026", (req, res) =>
    renderSeoPage("rtse-2026", req, res)
);

router.get("/rtse-26", (req, res) =>
    res.redirect(301, "/rtse-2026")
);

router.get("/ratabari-talent-search-examination", (req, res) =>
    renderSeoPage("ratabari-talent-search-examination", req, res)
);


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
Disallow: /rtse/student

Sitemap: ${SITE_URL}/sitemap.xml
`);

});


// =====================================================
// SITEMAP.XML
// =====================================================

router.get("/sitemap.xml", (req, res) => {

    const urls = [

        // Main website
        "/",
        "/about",
        "/chairman-message",
        "/principal-message",
        "/chancellor-message",
        "/admission",
        "/gallery",
        "/news",
        "/notice",

        // ARSP
        "/arsp",
        "/active-rural-social-progress",
        "/all-ratabari-student-parishad",
        "/all-ratabari-student-power",
        "/arsp/register",
        "/arsp/team",
        "/arsp/founder",
        "/arsp/organizing-body",
        "/arsp/chief-adviser",
        "/arsp/advisory-body",

        // HONOUR HEART
        "/honour-heart",
        "/honour-heart/legends",

        // RTSE
        "/rtse",
        "/rtse-2026",
        "/ratabari-talent-search-examination",
        "/rtse/apply",
        "/rtse/registration-slip",
        "/rtse/result",
        "/rtse/certificate"
    ];

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const escapeXml = (value) =>
        String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

    const xmlUrls = urls.map((url) => {

        const priority =
            url === "/" ? "1.0" :
            url === "/arsp" ? "0.9" :
            url === "/active-rural-social-progress" ? "0.9" :
            url === "/rtse" ? "0.9" :
            url === "/rtse-2026" ? "0.9" :
            url === "/honour-heart" ? "0.8" :
            "0.7";

        const changefreq =
            url === "/" ? "weekly" :
            url === "/news" ? "daily" :
            url === "/notice" ? "daily" :
            "monthly";

        return `
    <url>
        <loc>${SITE_URL}${escapeXml(url)}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>`;

    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

    res.type("application/xml");
    res.send(xml);
});


module.exports = router;
