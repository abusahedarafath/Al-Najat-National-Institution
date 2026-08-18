CREATE TABLE IF NOT EXISTS arsp_schools (
    id INT(11) NOT NULL AUTO_INCREMENT,
    school_code VARCHAR(30) NOT NULL UNIQUE,
    school_name VARCHAR(200) NOT NULL,
    school_type ENUM(
        'School',
        'Madrasa',
        'School & Madrasa',
        'College',
        'Other'
    ) NOT NULL DEFAULT 'School',
    head_name VARCHAR(150) NULL,
    mobile VARCHAR(20) NULL,
    email VARCHAR(120) NULL,
    address TEXT NULL,
    village VARCHAR(150) NULL,
    post_office VARCHAR(150) NULL,
    district VARCHAR(100) NULL,
    state VARCHAR(100) NULL DEFAULT 'Assam',
    pincode VARCHAR(20) NULL,
    status ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'Inactive'
    ) NOT NULL DEFAULT 'Pending',
    remarks TEXT NULL,
    created_by INT(11) NULL,
    approved_by INT(11) NULL,
    approved_at DATETIME NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_school_name (school_name),
    INDEX idx_school_district (district),
    INDEX idx_school_status (status),
    INDEX idx_school_code (school_code)
);
