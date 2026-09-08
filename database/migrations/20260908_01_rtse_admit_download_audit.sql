CREATE TABLE IF NOT EXISTS rtse_admit_downloads (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    application_id BIGINT UNSIGNED NOT NULL,
    registration_no VARCHAR(100) NOT NULL,
    student_name VARCHAR(255) NOT NULL,

    google_subject VARCHAR(255) NOT NULL,
    google_email VARCHAR(320) NOT NULL,
    google_name VARCHAR(255) NOT NULL,

    mobile VARCHAR(20) NOT NULL,
    mobile_verified TINYINT(1) NOT NULL DEFAULT 0,

    otp_provider VARCHAR(50) DEFAULT NULL,
    otp_request_id VARCHAR(255) DEFAULT NULL,

    verified_at DATETIME DEFAULT NULL,
    downloaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,

    PRIMARY KEY (id),

    KEY idx_rtse_admit_download_application (
        application_id
    ),

    KEY idx_rtse_admit_download_registration (
        registration_no
    ),

    KEY idx_rtse_admit_download_google_subject (
        google_subject
    ),

    KEY idx_rtse_admit_download_google_email (
        google_email
    ),

    KEY idx_rtse_admit_download_mobile (
        mobile
    ),

    KEY idx_rtse_admit_downloaded_at (
        downloaded_at
    )

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
