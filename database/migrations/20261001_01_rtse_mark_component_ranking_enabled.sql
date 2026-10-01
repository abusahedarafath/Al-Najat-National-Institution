-- =============================================
-- RTSE Mark Component Ranking Control
-- =============================================
-- Additive only.
-- Existing components default to ranking_enabled = 1
-- so their current ranking behavior is preserved.
-- Existing result/component marks are untouched.
-- =============================================

ALTER TABLE rtse_mark_components
    ADD COLUMN ranking_enabled TINYINT(1) NOT NULL DEFAULT 1
    AFTER grade_counting;
