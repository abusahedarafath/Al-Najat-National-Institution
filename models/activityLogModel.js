const db = require("../config/database");
exports.create = async (log) => {

    const sql = `
        INSERT INTO activity_logs
        (
            user_id,
            username,
            role,
            module,
            action,
            ip_address
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    return db.query(sql,[
        log.user_id,
        log.username,
        log.role,
        log.module,
        log.action,
        log.ip_address
    ]);

};
