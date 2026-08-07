-- ===========================================
-- TRANSPORT ROUTES
-- ===========================================

CREATE TABLE IF NOT EXISTS transport_routes (

    id INT AUTO_INCREMENT PRIMARY KEY,

    route_name VARCHAR(150) NOT NULL,

    start_point VARCHAR(150) NOT NULL,

    end_point VARCHAR(150) NOT NULL,

    fare DECIMAL(10,2) DEFAULT 0,

    status ENUM('Active','Inactive') DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

);

-- ===========================================
-- VEHICLES
-- ===========================================

CREATE TABLE IF NOT EXISTS vehicles (

    id INT AUTO_INCREMENT PRIMARY KEY,

    route_id INT,

    vehicle_name VARCHAR(150) NOT NULL,

    vehicle_number VARCHAR(100) NOT NULL UNIQUE,

    vehicle_type ENUM('Bus','Van','Car') DEFAULT 'Bus',

    capacity INT DEFAULT 0,

    driver_name VARCHAR(150),

    driver_mobile VARCHAR(20),

    status ENUM('Active','Inactive') DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (route_id)
    REFERENCES transport_routes(id)
    ON DELETE SET NULL

);
