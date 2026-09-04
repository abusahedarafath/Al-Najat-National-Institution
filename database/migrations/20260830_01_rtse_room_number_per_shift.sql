-- ============================================================
-- RTSE Seat Plan: Room numbering is independent per Shift
-- ============================================================
--
-- Correct hierarchy:
--     Shift 1 -> Room 1, Room 2, Room 3...
--     Shift 2 -> Room 1, Room 2, Room 3...
--
-- Room numbers must therefore be unique only within:
--     application_year + shift_id
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Remove the old year-wide room-number uniqueness.
ALTER TABLE rtse_seat_plan_rooms
    DROP INDEX uq_rtse_seat_plan_room_year_no;

-- Room numbers are now unique inside each shift for each exam year.
ALTER TABLE rtse_seat_plan_rooms
    ADD UNIQUE KEY uq_rtse_seat_plan_room_shift_year_no
        (application_year, shift_id, room_no);

SET FOREIGN_KEY_CHECKS = 1;
