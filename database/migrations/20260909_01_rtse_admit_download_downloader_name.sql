ALTER TABLE rtse_admit_downloads
ADD COLUMN IF NOT EXISTS downloader_name VARCHAR(255) DEFAULT NULL
AFTER google_name;
