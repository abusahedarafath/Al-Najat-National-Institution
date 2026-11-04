-- ARSP homepage member display configuration.
-- Design selection and member visibility are independent of appointments.
-- Members without a visibility record are visible by default.

CREATE TABLE IF NOT EXISTS arsp_homepage_member_display_settings (
    id TINYINT UNSIGNED NOT NULL,
    is_enabled TINYINT(1) NOT NULL DEFAULT 1,
    design_key VARCHAR(40) NOT NULL DEFAULT 'carousel',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO arsp_homepage_member_display_settings
    (id, is_enabled, design_key)
VALUES
    (1, 1, 'carousel');

CREATE TABLE IF NOT EXISTS arsp_homepage_member_visibility (
    member_id INT(11) NOT NULL,
    is_visible TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NULL DEFAULT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (member_id),
    CONSTRAINT fk_arsp_homepage_visibility_member
        FOREIGN KEY (member_id)
        REFERENCES arsp_members (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
