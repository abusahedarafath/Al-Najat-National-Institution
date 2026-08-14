const db = require("../config/database");

const ArspSetting = require("../models/ArspSetting");


exports.profile = async (req, res) => {

    try {

        const [rows] = await db.query(

            `SELECT
                m.*,
                p.section,
                p.designation,
                r.region_name,
                c.committee_name,
                c.session_name

            FROM arsp_members m

            LEFT JOIN arsp_management_positions p
                ON m.id = p.member_id
                AND p.status='Active'

            LEFT JOIN arsp_regions r
                ON p.region_id = r.id

            LEFT JOIN arsp_committees c
                ON p.committee_id = c.id

            WHERE m.member_id=?`,

            [req.params.memberId]

        );

        if(rows.length===0){

            return res.status(404).send("Member not found.");

        }

        res.render(

            "arsp/member-profile",

            {

                title:"ARSP Member",

                member:rows[0]

            }

        );

    }

    catch(err){

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

};



exports.verify = async (req, res) => {

    try {

        const arsp = await ArspSetting.get();

        return res.render(
            "arsp/member-verify",
            {
                title: "ARSP QR Verification",
                valid: false,
                scannerOnly: true,
                message: "Please Verify the QR using the official ARSP QR Scanner.",
                arsp
            }
        );

    } catch (err) {

        console.error(err);

        res.status(500).send("Verification failed.");

    }

};



