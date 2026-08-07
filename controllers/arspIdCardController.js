const ArspMember = require("../models/ArspMember");
const IdentityCardSetting = require("../models/IdentityCardSetting");
const ArspManagementPosition = require("../models/ArspManagementPosition");

exports.view = async (req, res) => {

    try {

        const member =
            await ArspMember.getById(req.params.id);

        if (!member) {

            req.flash("error", "Member not found.");

            return res.redirect("/admin/arsp/members");

        }

        const settings =
            await IdentityCardSetting.get();

        const position =
            await ArspManagementPosition.getByMemberId(member.id);

        if (position) {

            member.designation =
                position.designation || position.section;

            member.section =
                position.section;

            member.committee =
                position.committee_name || "-";

        } else {

            member.designation = "ARSP Member";

            member.section = "-";

            member.committee = "-";

        }

res.render("admin/arsp/id-card-print", {
            title: "ARSP Digital ID Card",

            member,

            settings

        });

    } catch (err) {

        console.error(err);

        req.flash("error", "Unable to generate ID Card.");

        res.redirect("/admin/arsp/members");

    }

};
