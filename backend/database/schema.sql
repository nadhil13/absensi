CREATE DATABASE IF NOT EXISTS attendance_qr_system;
USE attendance_qr_system;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    department VARCHAR(50),
    position VARCHAR(50),
    phone VARCHAR(20),
    profile_image VARCHAR(255),
    face_data TEXT,
    qr_code VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'half_day') DEFAULT 'present',
    check_in_qr VARCHAR(255),
    check_out_qr VARCHAR(255),
    location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date)
);

-- QR Codes table for session management
CREATE TABLE qr_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    qr_code_data VARCHAR(500) NOT NULL,
    type ENUM('check_in', 'check_out') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (used_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Settings table
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (user_id, email, password, full_name, role, department, position) 
VALUES (
    'ADMIN001', 
    'admin@company.com', 
    '$2a$10$RqEwXpGF.7a8FVQfJ.rUOe8RqYkW5tI4BmH8lNXNrZNrGgKxV5H.C', 
    'System Administrator', 
    'admin', 
    'IT Department', 
    'System Administrator'
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('company_name', 'PT. Modern Technology', 'Company name for the system'),
('work_start_time', '08:00:00', 'Standard work start time'),
('work_end_time', '17:00:00', 'Standard work end time'),
('late_tolerance', '15', 'Late tolerance in minutes'),
('qr_refresh_interval', '300', 'QR code refresh interval in seconds'),
('max_attendance_distance', '100', 'Maximum distance for attendance in meters');

-- Create indexes for better performance
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_qr_sessions_expires ON qr_sessions(expires_at);
CREATE INDEX idx_users_qr_code ON users(qr_code);
CREATE INDEX idx_users_active ON users(is_active);