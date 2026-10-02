CREATE TABLE IF NOT EXISTS website_visitor_daily (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    visitor_id CHAR(36) NOT NULL,
    visit_date DATE NOT NULL,
    last_seen_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_website_visitor_daily_visitor_date (visitor_id, visit_date),
    KEY idx_website_visitor_daily_date (visit_date),
    CONSTRAINT fk_website_visitor_daily_visitor
        FOREIGN KEY (visitor_id)
        REFERENCES website_visitors(visitor_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
