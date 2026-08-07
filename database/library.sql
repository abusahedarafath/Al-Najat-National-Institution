-- ===========================================
-- BOOK CATEGORIES
-- ===========================================

CREATE TABLE IF NOT EXISTS book_categories (

    id INT AUTO_INCREMENT PRIMARY KEY,

    category_name VARCHAR(100) NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

);

-- ===========================================
-- BOOKS
-- ===========================================

CREATE TABLE IF NOT EXISTS books (

    id INT AUTO_INCREMENT PRIMARY KEY,

    category_id INT,

    title VARCHAR(255) NOT NULL,

    author VARCHAR(255),

    publisher VARCHAR(255),

    isbn VARCHAR(100),

    edition VARCHAR(50),

    quantity INT DEFAULT 1,

    available_quantity INT DEFAULT 1,

    shelf_no VARCHAR(50),

    status ENUM('Available','Unavailable')
    DEFAULT 'Available',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id)
    REFERENCES book_categories(id)
    ON DELETE SET NULL

);

-- ===========================================
-- BOOK ISSUES
-- ===========================================

CREATE TABLE IF NOT EXISTS book_issues (

    id INT AUTO_INCREMENT PRIMARY KEY,

    student_id INT NOT NULL,

    book_id INT NOT NULL,

    issue_date DATE NOT NULL,

    due_date DATE NOT NULL,

    return_date DATE NULL,

    status ENUM(
        'Issued',
        'Returned',
        'Late'
    ) DEFAULT 'Issued',

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE CASCADE,

    FOREIGN KEY (book_id)
    REFERENCES books(id)
    ON DELETE CASCADE

);
