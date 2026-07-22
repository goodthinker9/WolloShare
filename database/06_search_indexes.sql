-- =====================================================
-- Migration 06: Search & Discovery Indexes
-- =====================================================
-- Purpose: Optimize text search, filtering, and sorting
-- for the resource search/discovery feature.
-- Run AFTER migration 04 (resources) and 03 (courses).
-- =====================================================

USE wolloshare;

-- ────────────────────────────────────────────────────
-- 1. FULLTEXT indexes for fast natural-language search
-- ────────────────────────────────────────────────────
-- These enable MySQL FULLTEXT searches across title,
-- description, and tags simultaneously. The parser
-- handles word boundaries, stopwords, and relevance scoring.
-- This is significantly faster than multiple LIKE '%term%'
-- scans on large datasets.

ALTER TABLE resources
  ADD FULLTEXT INDEX ft_resources_search (title, description, tags);

-- Allow searching by course name and course code.
-- Students often search by course code (e.g., "CS101")
-- or course name (e.g., "Data Structures").

ALTER TABLE courses
  ADD FULLTEXT INDEX ft_courses_search (course_name, course_code);

-- ────────────────────────────────────────────────────
-- 2. Covering indexes for sorted pagination
-- ────────────────────────────────────────────────────
-- These composite indexes cover the WHERE + ORDER BY
-- so MySQL can satisfy the query entirely from the index
-- without touching table rows (index-only scan).
-- The approval_status = 'approved' filter is always present,
-- so it is the leading column in each index.

-- For 'newest' sort:  ORDER BY created_at DESC
CREATE INDEX idx_approved_created
  ON resources (approval_status, created_at);

-- For 'oldest' sort:   ORDER BY created_at ASC
-- (same index, MySQL can traverse forward or backward)

-- For 'most_downloaded' sort:  ORDER BY download_count DESC
CREATE INDEX idx_approved_downloads
  ON resources (approval_status, download_count);

-- For 'alphabetical' sort:  ORDER BY title ASC
CREATE INDEX idx_approved_title
  ON resources (approval_status, title);

-- ────────────────────────────────────────────────────
-- 3. Rating aggregation optimization
-- ────────────────────────────────────────────────────
-- When sorting by 'highest_rated', we compute AVG(rating)
-- per resource. This composite index allows a fast
-- index-only aggregation without scanning the ratings table.

CREATE INDEX idx_ratings_resource_score
  ON ratings (resource_id, rating);

-- ────────────────────────────────────────────────────
-- 4. Semester filter optimization
-- ────────────────────────────────────────────────────
-- Semester is a low-cardinality filter, useful in combination
-- with approval_status for filtered searches.

CREATE INDEX idx_approved_semester
  ON resources (approval_status, semester);

-- ────────────────────────────────────────────────────
-- 5. Academic level + department composite filter
-- ────────────────────────────────────────────────────
-- When both filters are applied simultaneously.

CREATE INDEX idx_approved_dept_level
  ON resources (approval_status, department_id, academic_level_id);

