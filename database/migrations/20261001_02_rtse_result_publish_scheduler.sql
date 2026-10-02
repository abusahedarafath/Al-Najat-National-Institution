ALTER TABLE rtse_settings
    ADD COLUMN result_publish_scheduled TINYINT(1) NOT NULL DEFAULT 0 AFTER result_publish,
    ADD COLUMN result_publish_at DATETIME NULL AFTER result_publish_scheduled;
