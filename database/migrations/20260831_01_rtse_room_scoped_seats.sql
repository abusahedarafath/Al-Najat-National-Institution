-- ============================================================
-- RTSE Seat Plan: room-scoped seats
-- ============================================================
--
-- Room numbering was already migrated by:
-- 20260830_01_rtse_room_number_per_shift.sql
--
-- This migration only makes seats belong to rooms.
--
-- Final hierarchy:
--
--     Shift -> Room -> Seat
--
-- Seat numbering:
--
--     Room 1 -> Seat 1, Seat 2, Seat 3...
--     Room 2 -> Seat 1, Seat 2, Seat 3...
--
-- Existing seat rows are currently empty, so room_id can safely
-- be introduced as NOT NULL.
-- ============================================================

ALTER TABLE rtse_seat_plan_seats
    ADD COLUMN room_id INT NOT NULL AFTER shift_id;

ALTER TABLE rtse_seat_plan_seats
    DROP INDEX uq_rtse_seat_plan_seat_shift_no;

ALTER TABLE rtse_seat_plan_seats
    ADD UNIQUE KEY uq_rtse_seat_plan_seat_room_no
        (room_id, seat_no);

ALTER TABLE rtse_seat_plan_seats
    ADD KEY idx_rtse_seat_plan_seats_room
        (room_id);

ALTER TABLE rtse_seat_plan_seats
    ADD CONSTRAINT fk_rtse_seat_plan_seats_room
        FOREIGN KEY (room_id)
        REFERENCES rtse_seat_plan_rooms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;
