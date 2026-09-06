ALTER TABLE rtse_seat_plan_rooms
    ADD COLUMN universal_gender_lock ENUM('Male','Female') NULL
        AFTER right_section_lock,
    ADD COLUMN universal_section_lock CHAR(1) NULL
        AFTER universal_gender_lock;
