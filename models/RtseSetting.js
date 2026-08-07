const db = require("../config/database");

class RtseSetting {

    // =====================================
    // Get Settings
    // =====================================

    static async get() {

        const [rows] = await db.query(

            `SELECT *
             FROM rtse_settings
             LIMIT 1`

        );

        return rows[0] || null;

    }

    // =====================================
    // Close Applications
    // =====================================

    static async closeApplications() {

        await db.query(

            `UPDATE rtse_settings
             SET application_open=0
             WHERE id=1`

        );

    }

    // =====================================
    // Open Applications
    // =====================================

    static async openApplications() {

        await db.query(

            `UPDATE rtse_settings
             SET application_open=1
             WHERE id=1`

        );

    }

    // =====================================
    // Publish Admit Cards
    // =====================================

    static async publishAdmitCards() {

        await db.query(

            `UPDATE rtse_settings
             SET admit_publish=1
             WHERE id=1`

        );

    }

    // =====================================
    // Hide Admit Cards
    // =====================================

    static async hideAdmitCards() {

        await db.query(

            `UPDATE rtse_settings
             SET admit_publish=0
             WHERE id=1`

        );

    }

    // =====================================
    // Publish Results
    // =====================================

    // =====================================
// Publish Results
// =====================================

static async publishResults() {

    await db.query(

        `UPDATE rtse_settings

         SET

            result_publish=1

         WHERE id=1`

    );

}





    // =====================================
    // Hide Results
    // =====================================

    // =====================================
// Hide Results
// =====================================

static async hideResults() {

    await db.query(

        `UPDATE rtse_settings

         SET

            result_publish=0

         WHERE id=1`

    );

}





// =====================================
// Publish Certificates
// =====================================

static async publishCertificates(){

    await db.query(

        `UPDATE rtse_settings

         SET certificate_publish=1

         WHERE id=1`

    );

}



// =====================================
// Hide Certificates
// =====================================

static async hideCertificates(){

    await db.query(

        `UPDATE rtse_settings

         SET certificate_publish=0

         WHERE id=1`

    );

}




}

module.exports = RtseSetting;
