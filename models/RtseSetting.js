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

static async saveResultPublishSchedule(enabled, publishAt, countdownSeconds) {
    await db.query(
        `UPDATE rtse_settings
         SET
            result_publish_scheduled=?,
            result_publish_at=?,
            result_publish_countdown_seconds=?,
            result_publish=CASE
                WHEN ? = 1 THEN 0
                ELSE result_publish
            END
         WHERE id=1`,
        [
            enabled ? 1 : 0,
            publishAt || null,
            Number.isFinite(Number(countdownSeconds))
                ? Math.max(0, Math.floor(Number(countdownSeconds)))
                : 0,
            enabled ? 1 : 0
        ]
    );
}

static async publishScheduledResults() {
    const [result] = await db.query(
        `UPDATE rtse_settings
         SET
            result_publish=1,
            result_publish_scheduled=0,
            result_publish_at=NULL,
            result_publish_countdown_seconds=0
         WHERE id=1
           AND result_publish_scheduled=1
           AND result_publish_at IS NOT NULL
           AND result_publish_at <= UTC_TIMESTAMP()`
    );

    return result.affectedRows > 0;
}

static async publishResults() {
    await db.query(
        `UPDATE rtse_settings
         SET
            result_publish=1,
            result_publish_scheduled=0,
            result_publish_at=NULL,
            result_publish_countdown_seconds=0
         WHERE id=1`
    );
}

static async hideResults() {
    await db.query(
        `UPDATE rtse_settings
         SET
            result_publish=0,
            result_publish_scheduled=0,
            result_publish_at=NULL,
            result_publish_countdown_seconds=0
         WHERE id=1`
    );
}

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
