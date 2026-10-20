-- RTSE custom class names in the existing class-to-section mapping.
-- Migration source only. Review and run separately when explicitly approved.
-- Existing numeric class values remain equivalent strings after widening.
-- This migration does not update or delete historical application records.

ALTER TABLE rtse_exam_section_classes
    MODIFY COLUMN student_class VARCHAR(50) NOT NULL;

ALTER TABLE rtse_applications
    MODIFY COLUMN `class` VARCHAR(50) NOT NULL;
