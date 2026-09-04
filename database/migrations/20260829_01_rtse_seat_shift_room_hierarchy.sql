-- ============================================================
-- RTSE Seat Plan: Shift -> Rooms hierarchy
-- ============================================================
-- Previous:
--     Room -> Shifts
--
-- New:
--     Shift -> Rooms
--
-- Existing room/shift relationships are preserved.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Add shift_id to rooms.
-- ------------------------------------------------------------

ALTER TABLE rtse_seat_plan_rooms
    ADD COLUMN shift_id INT NULL AFTER id;

-- ------------------------------------------------------------
-- Preserve the existing Room -> Shift relationship.
--
-- Existing:
--     rtse_seat_plan_shifts.room_id
--
-- New:
--     rtse_seat_plan_rooms.shift_id
-- ------------------------------------------------------------

UPDATE rtse_seat_plan_rooms r
INNER JOIN rtse_seat_plan_shifts s
    ON s.room_id = r.id
SET r.shift_id = s.id
WHERE r.shift_id IS NULL;

-- ------------------------------------------------------------
-- Every existing room must now belong to a shift.
-- ------------------------------------------------------------

ALTER TABLE rtse_seat_plan_rooms
    MODIFY COLUMN shift_id INT NOT NULL;

-- ------------------------------------------------------------
-- Add index and foreign key:
--
--     rooms.shift_id -> shifts.id
-- ------------------------------------------------------------

ALTER TABLE rtse_seat_plan_rooms
    ADD KEY idx_rtse_seat_plan_rooms_shift (shift_id);

ALTER TABLE rtse_seat_plan_rooms
    ADD CONSTRAINT fk_rtse_seat_plan_rooms_shift
        FOREIGN KEY (shift_id)
        REFERENCES rtse_seat_plan_shifts(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;

-- ------------------------------------------------------------
-- Remove old Shift -> Room relationship.
-- ------------------------------------------------------------

ALTER TABLE rtse_seat_plan_shifts
    DROP FOREIGN KEY fk_rtse_seat_plan_shifts_room;

ALTER TABLE rtse_seat_plan_shifts
    DROP INDEX idx_rtse_seat_plan_shifts_room;

ALTER TABLE rtse_seat_plan_shifts
    DROP INDEX uq_rtse_seat_plan_shift_room_no;

ALTER TABLE rtse_seat_plan_shifts
    DROP COLUMN room_id;

-- ------------------------------------------------------------
-- New shift numbering is independent of rooms.
-- ------------------------------------------------------------

ALTER TABLE rtse_seat_plan_shifts
    ADD UNIQUE KEY uq_rtse_seat_plan_shift_no (shift_no);

SET FOREIGN_KEY_CHECKS = 1;
