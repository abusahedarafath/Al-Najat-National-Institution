-- =============================================
-- RTSE Mark Component Grade Counting
-- =============================================
-- Additive only.
-- Existing components default to grade_counting = 1
-- so their current grading behavior is preserved.
-- =============================================

ALTER TABLE rtse_mark_components
    ADD COLUMN grade_counting TINYINT(1) NOT NULL DEFAULT 1
    AFTER enabled;
