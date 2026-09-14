CREATE TABLE IF NOT EXISTS rtse_result_qr (
    id INT NOT NULL AUTO_INCREMENT,
    application_id INT NOT NULL,
    qr_token VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_rtse_result_qr_application (application_id),
    UNIQUE KEY uq_rtse_result_qr_token (qr_token),

    CONSTRAINT fk_rtse_result_qr_application
        FOREIGN KEY (application_id)
        REFERENCES rtse_applications(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
