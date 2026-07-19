const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "@asa+1Rb",
    database: "al_najat_db"
});

connection.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }

    console.log("✅ Connected to MariaDB");
});

module.exports = connection;
