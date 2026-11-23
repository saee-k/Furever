-- FurEver Pet Adoption & Matching Platform
-- Normalized MySQL 8.0+ Relational Database Schema

CREATE DATABASE IF NOT EXISTS furever_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE furever_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('adopter', 'lister', 'admin') NOT NULL DEFAULT 'adopter',
  phone VARCHAR(30) DEFAULT '',
  city VARCHAR(100) DEFAULT 'Bengaluru',
  housing_type VARCHAR(60) DEFAULT 'Apartment',
  bio TEXT,
  avatar_url VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- 2. Pets Table
CREATE TABLE IF NOT EXISTS pets (
  id VARCHAR(64) PRIMARY KEY,
  lister_id VARCHAR(64) NOT NULL,
  name VARCHAR(100) NOT NULL,
  species ENUM('Dog', 'Cat', 'Rabbit', 'Bird', 'Other') NOT NULL DEFAULT 'Dog',
  breed VARCHAR(120) NOT NULL,
  age_label VARCHAR(50) NOT NULL,
  age_category ENUM('Young', 'Adult', 'Senior') NOT NULL DEFAULT 'Young',
  gender ENUM('Male', 'Female') NOT NULL DEFAULT 'Male',
  weight VARCHAR(40) DEFAULT '10 kg',
  activity_level ENUM('Low', 'Moderate', 'High') NOT NULL DEFAULT 'Moderate',
  location VARCHAR(160) NOT NULL,
  shelter_name VARCHAR(160) NOT NULL,
  adoption_fee VARCHAR(80) NOT NULL DEFAULT 'Free Adoption',
  description TEXT NOT NULL,
  personality_json JSON NOT NULL,
  good_with_json JSON NOT NULL,
  vaccinated TINYINT(1) NOT NULL DEFAULT 1,
  spayed_neutered TINYINT(1) NOT NULL DEFAULT 1,
  microchipped TINYINT(1) NOT NULL DEFAULT 0,
  health_notes TEXT,
  adoption_requirements TEXT,
  status ENUM('AVAILABLE', 'PENDING', 'ADOPTED') NOT NULL DEFAULT 'AVAILABLE',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  primary_image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_lister FOREIGN KEY (lister_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pets_species (species),
  INDEX idx_pets_status (status),
  INDEX idx_pets_location (location),
  INDEX idx_pets_age_category (age_category)
) ENGINE=InnoDB;

-- 3. Pet Images Table (Multi-photo gallery per pet)
CREATE TABLE IF NOT EXISTS pet_images (
  id VARCHAR(64) PRIMARY KEY,
  pet_id VARCHAR(64) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(180) DEFAULT '',
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pet_images_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  INDEX idx_pet_images_pet_id (pet_id)
) ENGINE=InnoDB;

-- 4. Favourites Table
CREATE TABLE IF NOT EXISTS favourites (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  pet_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_favourites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favourites_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_pet_favourite (user_id, pet_id),
  INDEX idx_favourites_user (user_id)
) ENGINE=InnoDB;

-- 5. Swipe History Table
CREATE TABLE IF NOT EXISTS swipe_history (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  pet_id VARCHAR(64) NOT NULL,
  action ENUM('like', 'pass') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_swipes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_swipes_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_pet_swipe (user_id, pet_id),
  INDEX idx_swipes_user_action (user_id, action)
) ENGINE=InnoDB;

-- 6. Adoption Applications Table
CREATE TABLE IF NOT EXISTS adoption_applications (
  id VARCHAR(64) PRIMARY KEY,
  pet_id VARCHAR(64) NOT NULL,
  applicant_id VARCHAR(64) NOT NULL,
  lister_id VARCHAR(64) DEFAULT NULL,
  applicant_name VARCHAR(120) NOT NULL,
  applicant_email VARCHAR(160) NOT NULL,
  applicant_phone VARCHAR(30) NOT NULL,
  city VARCHAR(100) NOT NULL,
  housing_type VARCHAR(60) NOT NULL,
  has_yard TINYINT(1) NOT NULL DEFAULT 0,
  pet_experience VARCHAR(80) NOT NULL,
  household_members VARCHAR(120) DEFAULT 'Adults only',
  daily_alone_hours VARCHAR(40) DEFAULT '2-4 hours',
  fit_reason TEXT NOT NULL,
  eligibility_result ENUM('APPLICABLE', 'NOT_APPLICABLE') NOT NULL DEFAULT 'APPLICABLE',
  eligibility_reason TEXT,
  status ENUM('Pending', 'Under Review', 'Approved', 'Rejected', 'Withdrawn') NOT NULL DEFAULT 'Pending',
  reviewer_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_apps_pet FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  CONSTRAINT fk_apps_applicant FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_apps_lister FOREIGN KEY (lister_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_apps_applicant (applicant_id),
  INDEX idx_apps_pet (pet_id),
  INDEX idx_apps_status (status)
) ENGINE=InnoDB;

-- 7. Match Quiz Responses Table
CREATE TABLE IF NOT EXISTS quiz_responses (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) DEFAULT NULL,
  preferred_species VARCHAR(40) NOT NULL,
  living_space VARCHAR(60) NOT NULL,
  daily_availability VARCHAR(60) NOT NULL,
  activity_level VARCHAR(40) NOT NULL,
  pet_experience VARCHAR(60) NOT NULL,
  preferred_age VARCHAR(40) NOT NULL,
  recommended_pet_ids_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quiz_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_quiz_user (user_id)
) ENGINE=InnoDB;

-- 8. Lost & Found Reports Table
CREATE TABLE IF NOT EXISTS lost_found_reports (
  id VARCHAR(64) PRIMARY KEY,
  reporter_id VARCHAR(64) DEFAULT NULL,
  report_type ENUM('lost', 'found') NOT NULL,
  pet_name VARCHAR(100) DEFAULT 'Unknown',
  species ENUM('Dog', 'Cat', 'Rabbit', 'Bird', 'Other') NOT NULL DEFAULT 'Dog',
  breed VARCHAR(120) DEFAULT 'Mixed / Unknown',
  color_markings VARCHAR(160) NOT NULL,
  last_seen_location VARCHAR(200) NOT NULL,
  report_date DATE NOT NULL,
  description TEXT NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_phone VARCHAR(30) NOT NULL,
  contact_email VARCHAR(160) DEFAULT '',
  photo_url VARCHAR(500) DEFAULT NULL,
  status ENUM('Open', 'Reunited', 'Closed') NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lost_found_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_lost_found_type_status (report_type, status),
  INDEX idx_lost_found_location (last_seen_location)
) ENGINE=InnoDB;

-- 9. Veterinary Clinics Table
CREATE TABLE IF NOT EXISTS veterinary_clinics (
  id VARCHAR(64) PRIMARY KEY,
  clinic_name VARCHAR(160) NOT NULL,
  vet_name VARCHAR(120) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(160) DEFAULT '',
  hours VARCHAR(120) NOT NULL,
  services_json JSON NOT NULL,
  emergency_24_7 TINYINT(1) NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.8,
  is_verified TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vets_city (city)
) ENGINE=InnoDB;

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('application', 'match', 'system', 'lost_found') NOT NULL DEFAULT 'system',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id, is_read)
) ENGINE=InnoDB;

-- 11. Admin Activity Audit Table
CREATE TABLE IF NOT EXISTS admin_activity (
  id VARCHAR(64) PRIMARY KEY,
  admin_id VARCHAR(64) DEFAULT NULL,
  action_type VARCHAR(80) NOT NULL,
  target_table VARCHAR(60) NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  summary VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_activity_user FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_admin_activity_created (created_at)
) ENGINE=InnoDB;
