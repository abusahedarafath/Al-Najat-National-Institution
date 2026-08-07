const ArspMember = require("../models/ArspMember");

exports.dashboard = async (req, res) => {

    try {

        const member = await ArspMember.getById(

            req.session.arspMember.member_id

        );

        res.render(

            "arsp/dashboard",

            {

                title: "ARSP Member Dashboard",

                member

            }

        );

    }

    catch(err){

        console.error(err);

        res.redirect("/arsp/login");

    }

};
