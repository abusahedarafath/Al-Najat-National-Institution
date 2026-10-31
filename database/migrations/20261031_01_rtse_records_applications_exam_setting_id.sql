-- Preserve examination associations in archived RTSE applications.
-- This migration is retry-safe and does not backfill historical NULL values.
-- Fully qualified names preserve operational schema_migrations tracking.

SET @has_exam_setting_column = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'al_najat_records_db'
      AND TABLE_NAME = 'records_applications'
      AND COLUMN_NAME = 'exam_setting_id'
);

SET @ddl = IF(
    @has_exam_setting_column = 0,
    'ALTER TABLE al_najat_records_db.records_applications
       ADD COLUMN exam_setting_id INT NULL AFTER application_year',
    'SELECT 1'
);
PREPARE rtse_stmt FROM @ddl;
EXECUTE rtse_stmt;
DEALLOCATE PREPARE rtse_stmt;

SET @has_exam_setting_index = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = 'al_najat_records_db'
      AND TABLE_NAME = 'records_applications'
      AND INDEX_NAME = 'idx_records_apps_exam_setting'
);

SET @ddl = IF(
    @has_exam_setting_index = 0,
    'CREATE INDEX idx_records_apps_exam_setting
       ON al_najat_records_db.records_applications
          (application_year, exam_setting_id)',
    'SELECT 1'
);
PREPARE rtse_stmt FROM @ddl;
EXECUTE rtse_stmt;
DEALLOCATE PREPARE rtse_stmt;

SET @has_exam_setting_fk = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'al_najat_records_db'
      AND TABLE_NAME = 'records_applications'
      AND CONSTRAINT_NAME = 'fk_records_apps_exam_setting'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @ddl = IF(
    @has_exam_setting_fk = 0,
    'ALTER TABLE al_najat_records_db.records_applications
       ADD CONSTRAINT fk_records_apps_exam_setting
       FOREIGN KEY (application_year, exam_setting_id)
       REFERENCES al_najat_records_db.records_exam_settings
                  (application_year, id)
       ON DELETE RESTRICT ON UPDATE RESTRICT',
    'SELECT 1'
);
PREPARE rtse_stmt FROM @ddl;
EXECUTE rtse_stmt;
DEALLOCATE PREPARE rtse_stmt;
