ALTER TABLE website_visitors
    ADD COLUMN is_live TINYINT(1) NOT NULL DEFAULT 0
    AFTER last_seen_at,
    ADD KEY idx_website_visitors_live (is_live);
