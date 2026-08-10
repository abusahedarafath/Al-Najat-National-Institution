const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

const migrationsDir = path.join(__dirname, "migrations");

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INT NOT NULL AUTO_INCREMENT,
                filename VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith(".sql"))
            .sort();

        const [appliedRows] = await db.execute(
            "SELECT filename FROM schema_migrations ORDER BY id"
        );

        const applied = new Set(
            appliedRows.map(row => row.filename)
        );

        for (const file of files) {

            if (applied.has(file)) {
                console.log(`✓ Already applied: ${file}`);
                continue;
            }

            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, "utf8").trim();

            if (!sql) {
                console.log(`⚠ Skipping empty migration: ${file}`);
                continue;
            }

            try {
                await db.beginTransaction();

                await db.query(sql);

                await db.execute(
                    "INSERT INTO schema_migrations (filename) VALUES (?)",
                    [file]
                );

                await db.commit();

                console.log(`✓ Applied: ${file}`);

            } catch (error) {

                await db.rollback();

                throw error;
            }
        }

        console.log("✅ Database migrations completed successfully.");

    } finally {
        await db.end();
    }
}

main().catch(error => {
    console.error("❌ Migration failed:");
    console.error(error);
    process.exit(1);
});
