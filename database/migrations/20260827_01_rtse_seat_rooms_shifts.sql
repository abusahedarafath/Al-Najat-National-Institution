CREATE TABLE IF NOT EXISTS rtse_seat_plan_rooms (
    id INT NOT NULL AUTO_INCREMENT,
    application_year YEAR(4) NOT NULL,
    room_no INT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_rtse_seat_plan_room_year_no
        (application_year, room_no),

    KEY idx_rtse_seat_plan_rooms_year
        (application_year),

    KEY idx_rtse_seat_plan_rooms_active
        (application_year, is_active)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS rtse_seat_plan_shifts (
    id INT NOT NULL AUTO_INCREMENT,
    room_id INT NOT NULL,
    shift_no INT NOT NULL,
    shift_name VARCHAR(100) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_rtse_seat_plan_shift_room_no
        (room_id, shift_no),

    KEY idx_rtse_seat_plan_shifts_room
        (room_id),

    CONSTRAINT fk_rtse_seat_plan_shifts_room
        FOREIGN KEY (room_id)
        REFERENCES rtse_seat_plan_rooms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
