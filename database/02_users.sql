-- =====================================================
-- Migration 02: Users and student verification
-- =====================================================

USE wolloshare;

-- Users store all system accounts and define the base identity
-- for students and administrators. They are the parent record
-- for student verification and student profile data.
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    account_status ENUM('pending', 'active', 'suspended', 'disabled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role_status (role, account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student verification records link a user to their university
-- identity evidence. This table depends on users because only
-- authenticated users can be verified.
CREATE TABLE IF NOT EXISTS student_verifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    id_card_front_image VARCHAR(255) NOT NULL,
    verification_status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
    verified_by BIGINT UNSIGNED DEFAULT NULL,
    verified_at TIMESTAMP NULL DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_student_verifications_user (user_id),
    UNIQUE KEY uq_student_verifications_student_id (student_id),
    KEY idx_student_verifications_status (verification_status),
    CONSTRAINT fk_student_verifications_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_student_verifications_verified_by
        FOREIGN KEY (verified_by) REFERENCES users (id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
