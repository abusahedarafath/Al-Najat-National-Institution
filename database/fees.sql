-- ===========================================
-- FEE CATEGORIES
-- ===========================================

CREATE TABLE IF NOT EXISTS fee_categories (

    id INT AUTO_INCREMENT PRIMARY KEY,

    category_name VARCHAR(100) NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

);

-- ===========================================
-- FEE PAYMENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS fee_payments (

    id INT AUTO_INCREMENT PRIMARY KEY,

    student_id INT NOT NULL,

    fee_category_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    payment_method ENUM(
        'Cash',
        'UPI',
        'Bank Transfer',
        'Cheque'
    ) DEFAULT 'Cash',

    transaction_id VARCHAR(100),

    payment_date DATE NOT NULL,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE CASCADE,

    FOREIGN KEY (fee_category_id)
    REFERENCES fee_categories(id)
    ON DELETE CASCADE

);

-- ===========================================
-- FEE RECEIPTS
-- ===========================================

CREATE TABLE IF NOT EXISTS fee_receipts (

    id INT AUTO_INCREMENT PRIMARY KEY,

    receipt_no VARCHAR(50) UNIQUE NOT NULL,

    payment_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (payment_id)
    REFERENCES fee_payments(id)
    ON DELETE CASCADE

);
