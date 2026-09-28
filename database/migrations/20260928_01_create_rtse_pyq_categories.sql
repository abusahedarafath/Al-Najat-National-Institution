CREATE TABLE IF NOT EXISTS rtse_pyq_categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    year INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rtse_pyq_categories_year (year),
    KEY idx_rtse_pyq_categories_active_order (is_active, display_order, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE rtse_pyqs
    ADD COLUMN category_id BIGINT UNSIGNED NULL AFTER id,
    ADD KEY idx_rtse_pyqs_category (category_id),
    ADD CONSTRAINT fk_rtse_pyqs_category
        FOREIGN KEY (category_id)
        REFERENCES rtse_pyq_categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
