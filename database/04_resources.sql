-- =====================================================
-- Migration 04: Resources
-- =====================================================

USE wolloshare;

-- Resources are the core sharing entity. They link an uploader to
-- an academic course and represent the content students can search, download,
-- bookmark, rate, and report.
CREATE TABLE IF NOT EXISTS resources (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    uploader_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    resource_type ENUM('Lecture Note', 'Assignment', 'Exam', 'Book', 'Project') NOT NULL,
    approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_resources_uploader_id (uploader_id),
    KEY idx_resources_course_id (course_id),
    KEY idx_resources_approval_type (approval_status, resource_type),
    CONSTRAINT fk_resources_uploader
        FOREIGN KEY (uploader_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_resources_course
        FOREIGN KEY (course_id) REFERENCES courses (id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
