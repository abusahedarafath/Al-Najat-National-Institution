CREATE TABLE IF NOT EXISTS arsp_school_accounts (
    id INT(11) NOT NULL AUTO_INCREMENT,

    school_id INT(11) NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    account_status ENUM(
        'Active',
        'Inactive',
        'Suspended'
    ) NOT NULL DEFAULT 'Active',

    force_password_change TINYINT(1) NOT NULL DEFAULT 1,

    last_login DATETIME NULL,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_arsp_school_account_school_id (school_id),

    CONSTRAINT fk_arsp_school_accounts_school
        FOREIGN KEY (school_id)
        REFERENCES arsp_schools(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
