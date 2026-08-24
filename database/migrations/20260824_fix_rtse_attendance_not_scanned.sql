-- RTSE attendance states
-- NOT_SCANNED = admit generated, QR not yet scanned
-- ABSENT      = exam ended without attendance
-- PRESENT     = QR successfully scanned
--
-- Existing attendance records are preserved.

ALTER TABLE rtse_exam_attendance
MODIFY COLUMN attendance_status
ENUM('NOT_SCANNED', 'ABSENT', 'PRESENT')
NOT NULL DEFAULT 'NOT_SCANNED';
