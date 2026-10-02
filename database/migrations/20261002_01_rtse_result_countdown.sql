ALTER TABLE rtse_settings
    ADD COLUMN result_publish_countdown_seconds INT UNSIGNED NOT NULL DEFAULT 0
    AFTER result_publish_at;
