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
);

INSERT IGNORE INTO rtse_login_information_pdf_settings
(id)
VALUES (1);

CREATE TABLE IF NOT EXISTS rtse_login_information_pdfs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    prepared_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_rtse_login_pdf_application (application_id)
);
