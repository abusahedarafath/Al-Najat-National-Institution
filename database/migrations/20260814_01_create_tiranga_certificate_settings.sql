CREATE TABLE IF NOT EXISTS tiranga_certificate_settings (
    id INT NOT NULL AUTO_INCREMENT,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    organization_name VARCHAR(255) NOT NULL DEFAULT 'ACTIVE RURAL SOCIAL PROGRESS',
    certificate_title VARCHAR(255) NOT NULL DEFAULT 'TIRANGA CERTIFICATE',
    independence_text VARCHAR(255) NOT NULL DEFAULT '80th INDEPENDENCE',
    independence_years VARCHAR(100) NOT NULL DEFAULT '1947 - 2027',
    presented_text TEXT,
    description TEXT,
    event_date VARCHAR(255),
    participation_yes TEXT,
    participation_no TEXT,
    footer_text VARCHAR(500),
    logo VARCHAR(255),
    background_image VARCHAR(255),
    signature_image VARCHAR(255),
    signature_name VARCHAR(255),
    signature_designation VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tiranga_settings_id (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
