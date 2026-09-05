-- RTSE examination-specific shift configuration.
-- Reuses the existing rtse_seat_plan_shifts master.
-- Hierarchy: Examination -> Shift -> Sections.

CREATE TABLE IF NOT EXISTS rtse_exam_shifts (
    id INT NOT NULL AUTO_INCREMENT,
    exam_setting_id INT NOT NULL,
    shift_id INT NOT NULL,
    reporting_time TIME NULL,
    exam_start_time TIME NULL,
    exam_end_time TIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_rtse_exam_shift_exam_shift
        (exam_setting_id, shift_id),

    KEY idx_rtse_exam_shifts_exam
        (exam_setting_id),

    KEY idx_rtse_exam_shifts_shift
        (shift_id),

    CONSTRAINT fk_rtse_exam_shifts_exam
        FOREIGN KEY (exam_setting_id)
        REFERENCES rtse_exam_settings(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_rtse_exam_shifts_shift
        FOREIGN KEY (shift_id)
        REFERENCES rtse_seat_plan_shifts(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS rtse_exam_shift_sections (
    id INT NOT NULL AUTO_INCREMENT,
    exam_shift_id INT NOT NULL,
    section VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_rtse_exam_shift_section
        (exam_shift_id, section),

    KEY idx_rtse_exam_shift_sections_shift
        (exam_shift_id),

    CONSTRAINT fk_rtse_exam_shift_sections_shift
        FOREIGN KEY (exam_shift_id)
        REFERENCES rtse_exam_shifts(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
