"use strict";

const RtseLoginInformationPdf =
    require("../models/RtseLoginInformationPdf");

exports.page = async (req, res) => {
    try {
        const settings =
            await RtseLoginInformationPdf.getSettings();

        return res.render(
            "admin/rtse/login-information-pdf-settings",
            {
                title: "RTSE Login Information PDF Settings",
                settings
            }
        );
    } catch (error) {
        console.error(
            "RTSE login information PDF settings page error:",
            error
        );

        return res.status(500).send(
            "Unable to load Login Information PDF settings."
        );
    }
};

exports.update = async (req, res) => {
    try {
        const clean = (value, fallback = "") => {
            const text = String(value ?? "").trim();
            return text || fallback;
        };

        await RtseLoginInformationPdf.updateSettings({
            organization_name: clean(
                req.body.organization_name,
                "ACTIVE RURAL SOCIAL PROGRESS (ARSP)"
            ),
            exam_name: clean(
                req.body.exam_name,
                "RATABARI TALENT SEARCH EXAMINATION 2026"
            ),
            pdf_title: clean(
                req.body.pdf_title,
                "STUDENT LOGIN INFORMATION"
            ),
            pdf_subtitle: clean(
                req.body.pdf_subtitle,
                "Organized by Active Rural Social Progress"
            ),
            website_name: clean(
                req.body.website_name,
                "ARSP"
            ),
            website_url: clean(
                req.body.website_url,
                "https://arsp.co.in/"
            ),
            student_login_url: clean(
                req.body.student_login_url,
                "https://arsp.co.in/rtse/student/login"
            ),
            information_contact: clean(
                req.body.information_contact
            ),
            official_email: clean(
                req.body.official_email
            ),
            technical_contact: clean(
                req.body.technical_contact,
                "6901646612"
            ),
            password_instruction: clean(
                req.body.password_instruction,
                "Your registered 10-digit mobile number is your password."
            )
        });

        if (req.flash) {
            req.flash(
                "success",
                "RTSE Login Information PDF settings updated successfully."
            );
        }

        return res.redirect(
            "/admin/rtse/login-information-pdf-settings"
        );

    } catch (error) {
        console.error(
            "RTSE login information PDF settings update error:",
            error
        );

        if (req.flash) {
            req.flash(
                "error",
                "Unable to update Login Information PDF settings."
            );
        }

        return res.redirect(
            "/admin/rtse/login-information-pdf-settings"
        );
    }
};
