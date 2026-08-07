const ArspSetting = require("../models/ArspSetting");
const ArspRegistrationService = require("../services/arspRegistrationService");



exports.registerPage = async (req, res) => {

    try {

        const setting = await ArspSetting.get();

        return res.render(
            "arsp/register",
            {
               title: "Active Rural Social Progress",
                setting
            }
        );

    } catch (err) {

        console.error(err);

        const setting = await ArspSetting.get();

        return res.render(
            "arsp/register",
            {
                title: "Become an ARSP Member",
                setting,
                error: err.message,
                old: {}
            }
        );

    }

};

exports.register = async (req, res) => {




    try {

        const result =
            await ArspRegistrationService.register(

                {

                    ...req.body,

                    registration_source:
    "Self",

                    approval_status:
                        "Pending"

                },

                req

            );

        const setting =
            await ArspSetting.get();

        req.session.lastArspRegistration = {

            memberId:
                result.member.member_id,

            memberDbId:
                result.member.id,

           
            loginUrl:
                result.loginUrl,

            registrationSource:
    "Self"

        };

        return res.render(

            "arsp-documents/membership-registration-slip",

            {

                title:
                    "Membership Registration Slip",

                setting,

                member:
                    result.member,

                username:
                    result.memberId,

           
                loginUrl:
                    result.loginUrl,

                registrationSource:
                    "Self Registration"

            }

        );

    }

    catch (err) {

        console.error(err);

req.flash(
    "error",
    err.message
);

return res.redirect("/arsp/register");

    }

};
