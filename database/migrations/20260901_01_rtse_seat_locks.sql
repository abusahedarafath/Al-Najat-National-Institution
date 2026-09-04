-- ============================================================
-- RTSE Seat Lock System
-- Side-level gender/section locks + individual seat locks
-- ============================================================

ALTER TABLE rtse_seat_plan_rooms
    ADD COLUMN left_gender_lock ENUM('Male','Female') NULL
        AFTER is_active,
    ADD COLUMN right_gender_lock ENUM('Male','Female') NULL
        AFTER left_gender_lock,
    ADD COLUMN left_section_lock CHAR(1) NULL
        AFTER right_gender_lock,
    ADD COLUMN right_section_lock CHAR(1) NULL
        AFTER left_section_lock;

ALTER TABLE rtse_seat_plan_seats
    ADD COLUMN is_locked TINYINT(1) NOT NULL DEFAULT 0
        AFTER is_active;

ALTER TABLE rtse_seat_plan_seats
    ADD KEY idx_rtse_seat_plan_seats_locked
        (shift_id, room_id, is_locked);
