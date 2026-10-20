-- RTSE Custom Exam Sections
-- Additive migration for examination-specific section names,
-- class mappings, and inclusive roll-number suffix ranges.
-- Review before execution. Do not run against rtse records database.

CREATE TABLE IF NOT EXISTS rtse_exam_sections (
  id INT NOT NULL AUTO_INCREMENT,
  exam_setting_id INT NOT NULL,
  section_name VARCHAR(20) NOT NULL,
  roll_start INT UNSIGNED NOT NULL,
  roll_end INT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rtse_exam_section_name
    (exam_setting_id, section_name),
  UNIQUE KEY uq_rtse_exam_section_exam_id
    (exam_setting_id, id),
  CONSTRAINT chk_rtse_exam_section_roll_range
    CHECK (roll_start <= roll_end),
  CONSTRAINT fk_rtse_exam_sections_exam
    FOREIGN KEY (exam_setting_id)
    REFERENCES rtse_exam_settings (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rtse_exam_section_classes (
  id INT NOT NULL AUTO_INCREMENT,
  exam_setting_id INT NOT NULL,
  exam_section_id INT NOT NULL,
  student_class INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rtse_exam_section_class
    (exam_setting_id, student_class),
  KEY idx_rtse_exam_section_classes_section
    (exam_section_id),
  CONSTRAINT fk_rtse_exam_section_classes_section
    FOREIGN KEY (exam_setting_id, exam_section_id)
    REFERENCES rtse_exam_sections (exam_setting_id, id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Associate new applications with an examination.
-- Existing records deliberately remain NULL; no year-based backfill.
ALTER TABLE rtse_applications
  ADD COLUMN exam_setting_id INT NULL AFTER application_year,
  ADD KEY idx_rtse_applications_exam_section (exam_setting_id, section),
  ADD CONSTRAINT fk_rtse_applications_exam_setting
    FOREIGN KEY (exam_setting_id)
    REFERENCES rtse_exam_settings (id)
    ON DELETE RESTRICT;

-- Widen existing section fields without changing their current values.
ALTER TABLE rtse_applications
  MODIFY COLUMN section VARCHAR(20) NOT NULL;

ALTER TABLE rtse_seat_plan_seats
  MODIFY COLUMN section VARCHAR(20) NULL;

ALTER TABLE rtse_seat_plan_rooms
  MODIFY COLUMN left_section_lock VARCHAR(20) NULL,
  MODIFY COLUMN right_section_lock VARCHAR(20) NULL,
  MODIFY COLUMN universal_section_lock VARCHAR(20) NULL;

-- Seed missing legacy section names without overwriting existing
-- section ranges or administrator customizations.
INSERT INTO rtse_exam_sections
  (exam_setting_id, section_name, roll_start, roll_end, sort_order)
SELECT es.id, seed.section_name, seed.roll_start, seed.roll_end,
       seed.sort_order
FROM rtse_exam_settings AS es
CROSS JOIN (
  SELECT 'A' AS section_name, 1001 AS roll_start, 1999 AS roll_end,
         1 AS sort_order
  UNION ALL SELECT 'B', 2001, 2999, 2
  UNION ALL SELECT 'C', 3001, 3999, 3
  UNION ALL SELECT 'D', 4001, 4999, 4
  UNION ALL SELECT 'E', 5001, 5999, 5
) AS seed
WHERE NOT EXISTS (
  SELECT 1
  FROM rtse_exam_sections AS existing
  WHERE existing.exam_setting_id = es.id
    AND existing.section_name = seed.section_name
);

-- Seed only missing class mappings. Existing mappings are preserved.
INSERT INTO rtse_exam_section_classes
  (exam_setting_id, exam_section_id, student_class)
SELECT es.id, sec.id, mapping.student_class
FROM rtse_exam_settings AS es
JOIN (
  SELECT 4 AS student_class, 'A' AS section_name
  UNION ALL SELECT 5, 'A'
  UNION ALL SELECT 6, 'B'
  UNION ALL SELECT 7, 'B'
  UNION ALL SELECT 8, 'C'
  UNION ALL SELECT 9, 'D'
  UNION ALL SELECT 10, 'E'
) AS mapping
  ON 1 = 1
JOIN rtse_exam_sections AS sec
  ON sec.exam_setting_id = es.id
 AND sec.section_name = mapping.section_name
WHERE NOT EXISTS (
  SELECT 1
  FROM rtse_exam_section_classes AS existing
  WHERE existing.exam_setting_id = es.id
    AND existing.student_class = mapping.student_class
);
