const db = require("../config/database");

exports.findByUsername = (username, callback) => {
    const sql = "SELECT * FROM admins WHERE username = ?";
    db.query(sql, [username], callback);
};
