-- Add examination lifecycle status required by RtseExamSetting.
-- Safe for existing data: adds one column and preserves all existing rows.

ALTER TABLE rtse_exam_settings
    ADD COLUMN status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'INACTIVE';

-- Preserve the existing examination as the currently active RTSE examination.
UPDATE rtse_exam_settings
SET status = 'ACTIVE'
WHERE id = (
    SELECT id
    FROM (
        SELECT id
        FROM rtse_exam_settings
        ORDER BY id DESC
        LIMIT 1
    ) AS latest_exam
);
