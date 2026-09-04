-- ============================================================
-- RTSE: Application -> Shift -> Room -> Seat relationship
-- ============================================================
--
-- Adds explicit allocation references to applications while
-- preserving the legacy room_no / seat_no columns for compatibility.
--
-- Existing applications are NOT modified by this migration.
-- Existing NULL values are intentionally preserved.
-- ============================================================

ALTER TABLE rtse_applications
    ADD COLUMN shift_id INT NULL AFTER section,
    ADD COLUMN room_id INT NULL AFTER shift_id,
    ADD COLUMN seat_id INT NULL AFTER room_id;

ALTER TABLE rtse_applications
    ADD KEY idx_rtse_applications_shift_id (shift_id),
    ADD KEY idx_rtse_applications_room_id (room_id),
    ADD KEY idx_rtse_applications_seat_id (seat_id);

ALTER TABLE rtse_applications
    ADD CONSTRAINT fk_rtse_applications_shift
        FOREIGN KEY (shift_id)
        REFERENCES rtse_seat_plan_shifts(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

ALTER TABLE rtse_applications
    ADD CONSTRAINT fk_rtse_applications_room
        FOREIGN KEY (room_id)
        REFERENCES rtse_seat_plan_rooms(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

ALTER TABLE rtse_applications
    ADD CONSTRAINT fk_rtse_applications_seat
        FOREIGN KEY (seat_id)
        REFERENCES rtse_seat_plan_seats(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
