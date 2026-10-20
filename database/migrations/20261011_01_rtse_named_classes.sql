-- RTSE Named Classes
-- Additive migration source only. Do not execute until reviewed.
-- Existing numeric application classes are deliberately preserved.
-- Existing applications are not backfilled to named class definitions.

CREATE TABLE IF NOT EXISTS rtse_exam_classes (
    id INT NOT NULL AUTO_INCREMENT,
    exam_setting_id INT NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    exam_section_id INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rtse_exam_class_name
        (exam_setting_id, class_name),
    UNIQUE KEY uq_rtse_exam_class_exam_id
        (exam_setting_id, id),
    KEY idx_rtse_exam_classes_section
        (exam_setting_id, exam_section_id),
    CONSTRAINT fk_rtse_exam_classes_exam
        FOREIGN KEY (exam_setting_id)
        REFERENCES rtse_exam_settings (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_rtse_exam_classes_section
        FOREIGN KEY (exam_setting_id, exam_section_id)
        REFERENCES rtse_exam_sections (exam_setting_id, id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Optional link for new applications. Legacy class INT is unchanged.
-- No existing application is assigned a class definition automatically.
ALTER TABLE rtse_applications
    ADD COLUMN class_definition_id INT NULL AFTER exam_setting_id,
    ADD KEY idx_rtse_applications_class_definition
        (exam_setting_id, class_definition_id),
    ADD CONSTRAINT fk_rtse_applications_class_definition
        FOREIGN KEY (exam_setting_id, class_definition_id)
        REFERENCES rtse_exam_classes (exam_setting_id, id)
        ON DELETE RESTRICT;
