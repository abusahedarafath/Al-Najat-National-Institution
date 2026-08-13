CREATE TABLE IF NOT EXISTS scrolling_messages (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    message TEXT NOT NULL,
    url VARCHAR(1000) DEFAULT NULL,
    text_color VARCHAR(20) NOT NULL DEFAULT '#16246D',
    display_order INT NOT NULL DEFAULT 1,
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    start_date DATETIME DEFAULT NULL,
    end_date DATETIME DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_scrolling_messages_status_order (status, display_order),
    INDEX idx_scrolling_messages_dates (start_date, end_date)
);
