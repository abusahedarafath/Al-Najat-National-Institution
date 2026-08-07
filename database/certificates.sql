-- ===========================================
-- CERTIFICATES
-- ===========================================

CREATE TABLE IF NOT EXISTS certificates (

    id INT AUTO_INCREMENT PRIMARY KEY,

    certificate_no VARCHAR(50) NOT NULL UNIQUE,

    student_id INT NOT NULL,

    certificate_type ENUM(
        'Transfer Certificate',
        'Character Certificate',
        'Bonafide Certificate',
        'Study Certificate',
        'Fee Clearance Certificate',
        'Migration Certificate',
        'Experience Certificate'
    ) NOT NULL,

    issue_date DATE NOT NULL,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE CASCADE

);
