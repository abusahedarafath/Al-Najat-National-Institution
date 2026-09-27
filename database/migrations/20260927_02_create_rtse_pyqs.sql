CREATE TABLE IF NOT EXISTS rtse_pyqs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    year INT NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    pdf_path VARCHAR(1000) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_rtse_pyqs_year (year),
    KEY idx_rtse_pyqs_class (class_name),
    KEY idx_rtse_pyqs_active_order (is_active, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
