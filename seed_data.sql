-- Database schema and seed data for the Parking Payment module

CREATE DATABASE IF NOT EXISTS parking_payment_db;
USE parking_payment_db;

-- Assuming Hibernate creates the tables, this script is for seeding initial real-world like data
-- To run this, uncomment if you want manual table creation, otherwise let Spring Boot handle DDL.

-- Insert Users (Password is 'password123' hashed using standard BCrypt logic for these samples)
-- Note: Replace the hash with a real hashed token if using in actual test, for now this is just a representation 
-- Assuming hash for 'password123' is $2a$10$wN9iLpsN5Yy1/w1jA13M1eyH5/vVf0Rj8a89V/1K7a5k9cK3k23F.

INSERT INTO users (email, full_name, password_hash, role, created_at) 
VALUES 
('driver1@autopark.com', 'John Smith', '$2a$10$wN9iLpsN5Yy1/w1jA13M1eyH5/vVf0Rj8a89V/1K7a5k9cK3k23F.', 'DRIVER', NOW()),
('owner1@autopark.com', 'Acme Parking Corp', '$2a$10$wN9iLpsN5Yy1/w1jA13M1eyH5/vVf0Rj8a89V/1K7a5k9cK3k23F.', 'OWNER', NOW()),
('owner2@autopark.com', 'Sarah Jenkins', '$2a$10$wN9iLpsN5Yy1/w1jA13M1eyH5/vVf0Rj8a89V/1K7a5k9cK3k23F.', 'OWNER', NOW());

-- Insert Parking Slots
-- Assuming owner1 is ID 2, owner2 is ID 3
INSERT INTO parking_slots (address, hourly_rate, is_active, location_name, owner_id, created_at)
VALUES 
('123 Main St Garage', 4.50, 1, 'Downtown Core Alpha', 2, NOW()),
('45 West Blvd Open Lot', 2.00, 1, 'Westside Open Air Lot', 2, NOW()),
('777 Private Drive', 6.00, 1, 'Premium Covered Spot 1', 3, NOW());

-- Once Spring Boot runs and creates tables, run these inserts to populate the testing dashboards.
