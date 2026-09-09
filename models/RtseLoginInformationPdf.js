"use strict";

const db = require("../config/database");

class RtseLoginInformationPdf {

    static async ensureTables() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS rtse_login_information_pdf_settings (
                id INT NOT NULL PRIMARY KEY,
                organization_name VARCHAR(255) NOT NULL DEFAULT 'ACTIVE RURAL SOCIAL PROGRESS (ARSP)',
                exam_name VARCHAR(255) NOT NULL DEFAULT 'RATABARI TALENT SEARCH EXAMINATION 2026',
                pdf_title VARCHAR(255) NOT NULL DEFAULT 'STUDENT LOGIN INFORMATION',
                pdf_subtitle VARCHAR(255) NOT NULL DEFAULT 'Organized by Active Rural Social Progress',
                website_name VARCHAR(255) NOT NULL DEFAULT 'ARSP',
                website_url VARCHAR(500) NOT NULL DEFAULT 'https://arsp.co.in/',
                student_login_url VARCHAR(500) NOT NULL DEFAULT 'https://arsp.co.in/rtse/student/login',
                information_contact VARCHAR(500) NOT NULL DEFAULT '',
                official_email VARCHAR(255) NOT NULL DEFAULT '',
                technical_contact VARCHAR(100) NOT NULL DEFAULT '6901646612',
                password_instruction VARCHAR(500) NOT NULL DEFAULT 'Your registered 10-digit mobile number is your password.',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            INSERT IGNORE INTO rtse_login_information_pdf_settings
            (id)
            VALUES (1)
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS rtse_login_information_pdfs (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                application_id INT NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(1000) NOT NULL,
                prepared_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_rtse_login_pdf_application (application_id)
            )
        `);
    }

    static async getSettings() {
        await this.ensureTables();

        const [rows] = await db.query(`
            SELECT *
            FROM rtse_login_information_pdf_settings
            WHERE id=1
            LIMIT 1
        `);

        return rows[0] || null;
    }

    static async updateSettings(data) {
        await this.ensureTables();

        await db.query(`
            UPDATE rtse_login_information_pdf_settings
            SET
                organization_name=?,
                exam_name=?,
                pdf_title=?,
                pdf_subtitle=?,
                website_name=?,
                website_url=?,
                student_login_url=?,
                information_contact=?,
                official_email=?,
                technical_contact=?,
                password_instruction=?
            WHERE id=1
        `, [
            data.organization_name,
            data.exam_name,
            data.pdf_title,
            data.pdf_subtitle,
            data.website_name,
            data.website_url,
            data.student_login_url,
            data.information_contact,
            data.official_email,
            data.technical_contact,
            data.password_instruction
        ]);
    }

    static async getPrepared(applicationId) {
        await this.ensureTables();

        const [rows] = await db.query(`
            SELECT *
            FROM rtse_login_information_pdfs
            WHERE application_id=?
            LIMIT 1
        `, [applicationId]);

        return rows[0] || null;
    }

    static async savePrepared(applicationId, fileName, filePath) {
        await this.ensureTables();

        await db.query(`
            INSERT INTO rtse_login_information_pdfs
            (application_id, file_name, file_path)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                file_name=VALUES(file_name),
                file_path=VALUES(file_path),
                prepared_at=CURRENT_TIMESTAMP
        `, [applicationId, fileName, filePath]);

        return this.getPrepared(applicationId);
    }

    static async reset(applicationId) {
        await this.ensureTables();

        const [rows] = await db.query(`
            SELECT *
            FROM rtse_login_information_pdfs
            WHERE application_id=?
            LIMIT 1
        `, [applicationId]);

        await db.query(`
            DELETE FROM rtse_login_information_pdfs
            WHERE application_id=?
        `, [applicationId]);

        return rows[0] || null;
    }
}

module.exports = RtseLoginInformationPdf;
