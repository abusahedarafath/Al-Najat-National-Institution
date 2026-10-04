ALTER TABLE rtse_certificate_settings
    ADD COLUMN organized_by_label VARCHAR(255) NOT NULL DEFAULT 'Organized by'
    AFTER organized_by;
