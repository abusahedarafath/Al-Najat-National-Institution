ALTER TABLE tiranga_certificates
    ADD COLUMN father_name VARCHAR(255) NULL AFTER full_name,
    ADD COLUMN village_name VARCHAR(255) NULL AFTER father_name,
    ADD COLUMN post_office VARCHAR(255) NULL AFTER village_name,
    ADD COLUMN police_station VARCHAR(255) NULL AFTER post_office;
