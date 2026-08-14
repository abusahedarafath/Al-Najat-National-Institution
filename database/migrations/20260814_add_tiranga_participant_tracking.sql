ALTER TABLE tiranga_certificates
ADD COLUMN mobile VARCHAR(30) NOT NULL DEFAULT '' AFTER full_name,
ADD INDEX idx_tiranga_mobile (mobile),
ADD INDEX idx_tiranga_participation (participation_response),
ADD INDEX idx_tiranga_issue_date (issue_date)
