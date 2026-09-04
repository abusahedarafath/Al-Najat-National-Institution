CREATE TABLE IF NOT EXISTS rtse_seat_plan_seats (
    id INT NOT NULL AUTO_INCREMENT,
    shift_id INT NOT NULL,
    row_no INT NOT NULL,
    seat_no INT NOT NULL,
    position ENUM('LEFT','RIGHT','SINGLE') NOT NULL DEFAULT 'SINGLE',
    section CHAR(1) NULL,
    gender ENUM('Male','Female','Any') NOT NULL DEFAULT 'Any',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_rtse_seat_plan_seat_shift_no
        (shift_id, seat_no),

    KEY idx_rtse_seat_plan_seats_shift
        (shift_id),

    KEY idx_rtse_seat_plan_seats_row
        (shift_id, row_no),

    CONSTRAINT fk_rtse_seat_plan_seats_shift
        FOREIGN KEY (shift_id)
        REFERENCES rtse_seat_plan_shifts(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

ALTER TABLE rtse_seat_plan_shifts
    ADD COLUMN layout ENUM('TWO_SIDE','SINGLE_LINE')
        NOT NULL DEFAULT 'TWO_SIDE';
