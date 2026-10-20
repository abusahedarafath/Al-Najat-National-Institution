const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const recordsPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.RECORDS_DB_NAME || "al_najat_records_db",
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("Connected to MariaDB");
        conn.release();
    } catch (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }
})();

pool.recordsPool = recordsPool;

module.exports = pool;
