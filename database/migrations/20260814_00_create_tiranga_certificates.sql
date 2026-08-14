CREATE TABLE IF NOT EXISTS tiranga_certificates (
    id INT NOT NULL AUTO_INCREMENT,
    certificate_no VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    participation_response TEXT NULL,
    father_name VARCHAR(255) NULL,
    village_name VARCHAR(255) NULL,
    post_office VARCHAR(255) NULL,
    police_station VARCHAR(255) NULL,
    mobile VARCHAR(30) NOT NULL DEFAULT '',
    issue_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tiranga_certificate_no (certificate_no),
    INDEX idx_tiranga_issue_date (issue_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
