CREATE TABLE IF NOT EXISTS home_popups (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    buttons JSON NULL,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Inactive',
    start_at DATETIME NULL,
    end_at DATETIME NULL,
    display_frequency ENUM('always', 'session', 'daily') NOT NULL DEFAULT 'always',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_home_popups_status_dates (status, start_at, end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
