ALTER TABLE rtse_applications
ADD COLUMN IF NOT EXISTS roll_number INT NULL AFTER roll_no;
