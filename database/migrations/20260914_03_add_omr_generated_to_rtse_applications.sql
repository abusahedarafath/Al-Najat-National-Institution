ALTER TABLE rtse_applications
    ADD COLUMN omr_generated TINYINT(1) NOT NULL DEFAULT 0 AFTER admit_generated;
