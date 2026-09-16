-- =============================================
-- RTSE Configurable Mark Components
-- =============================================
-- Additive only.
-- Existing rtse_results and OMR data are untouched.
-- Components are configured per RTSE examination year.
-- =============================================

CREATE TABLE IF NOT EXISTS rtse_mark_components (
    id INT(11) NOT NULL AUTO_INCREMENT,
    application_year YEAR(4) NOT NULL,
    name VARCHAR(150) NOT NULL,
    maximum_marks DECIMAL(10,2) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT(11) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_rtse_mark_components_year
        (application_year),
    KEY idx_rtse_mark_components_year_enabled_order
        (application_year, enabled, display_order),

    CONSTRAINT chk_rtse_mark_components_maximum
        CHECK (maximum_marks > 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_uca1400_ai_ci;


CREATE TABLE IF NOT EXISTS rtse_result_component_marks (
    id INT(11) NOT NULL AUTO_INCREMENT,
    result_id INT(11) NOT NULL,
    component_id INT(11) NOT NULL,
    marks DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_rtse_result_component
        (result_id, component_id),

    KEY idx_rtse_result_component_result
        (result_id),

    KEY idx_rtse_result_component_component
        (component_id),

    CONSTRAINT fk_rtse_result_component_result
        FOREIGN KEY (result_id)
        REFERENCES rtse_results(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_rtse_result_component_component
        FOREIGN KEY (component_id)
        REFERENCES rtse_mark_components(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_rtse_result_component_marks
        CHECK (marks >= 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_uca1400_ai_ci;
