ALTER TABLE rtse_seat_plan_rooms
ADD COLUMN seat_system ENUM('FULL','CORNER_TO_CORNER')
NOT NULL DEFAULT 'FULL'
AFTER is_active;
