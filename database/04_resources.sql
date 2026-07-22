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
    department_id BIGINT UNSIGNED NOT NULL,
    academic_level_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    resource_type ENUM(
        'Lecture Note',
        'Assignment',
        'Past Exam',
        'Lab Manual',
        'Book',
        'Presentation',
        'Project',
        'Other'
    ) NOT NULL,
    semester VARCHAR(50) DEFAULT NULL,
    tags VARCHAR(500) DEFAULT NULL,
    file_size BIGINT UNSIGNED NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) NOT NULL DEFAULT '',
    approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    rejection_reason TEXT DEFAULT NULL,
    download_count INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    -- Standard B-tree indexes for FK lookups and filtering
    KEY idx_resources_uploader_id (uploader_id),
    KEY idx_resources_course_id (course_id),
    KEY idx_resources_department_id (department_id),
    KEY idx_resources_academic_level_id (academic_level_id),
    KEY idx_resources_approval_type (approval_status, resource_type),
    KEY idx_resources_semester (semester),
    -- FULLTEXT indexes for fast search on text columns
    FULLTEXT INDEX ft_resources_search (title, description, tags),
    -- Covering indexes for sorted pagination (approval_status is always filtered)
    KEY idx_approved_created (approval_status, created_at),
    KEY idx_approved_downloads (approval_status, download_count),
    KEY idx_approved_title (approval_status, title),
    KEY idx_approved_semester (approval_status, semester),
    KEY idx_approved_dept_level (approval_status, department_id, academic_level_id),
    CONSTRAINT fk_resources_uploader
        FOREIGN KEY (uploader_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_resources_course
        FOREIGN KEY (course_id) REFERENCES courses (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_resources_department
        FOREIGN KEY (department_id) REFERENCES departments (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_resources_academic_level
        FOREIGN KEY (academic_level_id) REFERENCES academic_levels (id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

