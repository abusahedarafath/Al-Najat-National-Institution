ALTER TABLE rtse_applications
ADD COLUMN school_id INT(11) NULL AFTER school_name;

ALTER TABLE rtse_applications
ADD INDEX idx_rtse_school_id (school_id);
