ALTER TABLE rtse_results
    ADD COLUMN IF NOT EXISTS total_marks DECIMAL(10,2) NULL AFTER marks,
    ADD COLUMN IF NOT EXISTS total_full_marks DECIMAL(10,2) NULL AFTER total_marks;
