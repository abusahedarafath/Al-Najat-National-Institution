const db = require("../config/database");

class ArspDashboard {

    static async getStats() {

        const [[members]] =
        await db.query(

            "SELECT COUNT(*) total FROM arsp_members"

        );

        const [[founders]] =
        await db.query(

            "SELECT COUNT(*) total FROM arsp_management_positions WHERE section='Founder' AND status='Active'"

        );

        const [[chief]] =
        await db.query(

            "SELECT COUNT(*) total FROM arsp_management_positions WHERE section='Chief Adviser' AND status='Active'"

        );

        const [[organizing]] =
        await db.query(

            "SELECT COUNT(*) total FROM arsp_management_positions WHERE section='Organizing Body' AND status='Active'"

        );

        const [[advisory]] =
        await db.query(

            "SELECT COUNT(*) total FROM arsp_management_positions WHERE section='Advisory Body' AND status='Active'"

        );

        const [[regions]] =
        await db.query(

            "SELECT COUNT(*) total FROM arsp_regions WHERE status='Active'"

        );

        const [[committees]] =
        await db.query(

            "SELECT COUNT(*) total FROM arsp_committees WHERE status='Active'"

        );

        return {

            members:members.total,

            founders:founders.total,

            chief:chief.total,

            organizing:organizing.total,

            advisory:advisory.total,

            regions:regions.total,

            committees:committees.total

        };

    }

}

module.exports = ArspDashboard;
