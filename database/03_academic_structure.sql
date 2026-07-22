-- =====================================================
-- Migration 03: Academic structure and student profiles
-- =====================================================

USE wolloshare;

-- Colleges are the highest-level academic organization unit.
-- Departments belong to a college and inherit its administrative context.
CREATE TABLE IF NOT EXISTS colleges (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_colleges_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Departments are attached to a college and are the parent
-- context for programs and courses.
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    college_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_departments_college_name (college_id, name),
    KEY idx_departments_college_id (college_id),
    CONSTRAINT fk_departments_college
        FOREIGN KEY (college_id) REFERENCES colleges (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Programs belong to a department and describe the academic track
-- a student follows within that department.
CREATE TABLE IF NOT EXISTS programs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    department_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_programs_department_name (department_id, name),
    KEY idx_programs_department_id (department_id),
    CONSTRAINT fk_programs_department
        FOREIGN KEY (department_id) REFERENCES departments (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Academic levels capture the progression of a student over time.
CREATE TABLE IF NOT EXISTS academic_levels (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_academic_levels_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses are taught within departments and are linked to resources.
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    department_id BIGINT UNSIGNED NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_courses_department_code (department_id, course_code),
    KEY idx_courses_department_id (department_id),
    CONSTRAINT fk_courses_department
        FOREIGN KEY (department_id) REFERENCES departments (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student profiles connect users to their academic identity.
-- This table depends on users, departments, programs, and academic levels.
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    program_id BIGINT UNSIGNED NOT NULL,
    academic_level_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_student_profiles_user (user_id),
    UNIQUE KEY uq_student_profiles_student_id (student_id),
    KEY idx_student_profiles_department_program (department_id, program_id),
    CONSTRAINT fk_student_profiles_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_student_profiles_department
        FOREIGN KEY (department_id) REFERENCES departments (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_student_profiles_program
        FOREIGN KEY (program_id) REFERENCES programs (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_student_profiles_academic_level
        FOREIGN KEY (academic_level_id) REFERENCES academic_levels (id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
