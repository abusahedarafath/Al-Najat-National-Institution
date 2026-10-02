CREATE TABLE IF NOT EXISTS website_visitors (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    visitor_id CHAR(36) NOT NULL,
    first_seen_at DATETIME NOT NULL,
    last_seen_at DATETIME NOT NULL,
    last_path VARCHAR(500) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_website_visitors_visitor_id (visitor_id),
    KEY idx_website_visitors_first_seen (first_seen_at),
    KEY idx_website_visitors_last_seen (last_seen_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
