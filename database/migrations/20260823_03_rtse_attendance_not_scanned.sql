-- RTSE attendance lifecycle correction.
--
-- NOT_SCANNED = attendance record exists but the candidate has not
-- been scanned yet.
--
-- PRESENT = candidate was successfully scanned.
--
-- ABSENT = explicitly marked absent after the examination process.
--
-- Existing ABSENT records are converted to NOT_SCANNED because the
-- current attendance implementation used ABSENT as its initial
-- pre-scan state. The current database was backed up before this change.

ALTER TABLE rtse_exam_attendance
    MODIFY COLUMN attendance_status
    ENUM('NOT_SCANNED','PRESENT','ABSENT')
    NOT NULL
    DEFAULT 'NOT_SCANNED';

UPDATE rtse_exam_attendance
SET attendance_status = 'NOT_SCANNED'
WHERE attendance_status = 'ABSENT'
  AND scanned_at IS NULL
  AND scanned_by IS NULL;
