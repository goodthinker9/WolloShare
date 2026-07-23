-- =====================================================
-- Migration 07: Admin Dashboard Indexes
-- =====================================================
--
-- Purpose:
--   Add supporting indexes for admin dashboard analytics
--   queries that aggregate data across large tables.
--
-- New Indexes:
--   1. idx_downloads_downloaded_at (downloaded_at)
--      - Enables efficient range scans for the weekly
--        downloads analytics query (WHERE downloaded_at >= X
--        GROUP BY DATE(downloaded_at)).
--      - Without this index, MySQL would scan the full
--        downloads table and use a filesort for aggregation.
-- =====================================================

USE wolloshare;

-- Index for weekly downloads analytics.
-- Enables an index-only range scan for:
--   SELECT DATE(downloaded_at) AS date, COUNT(*) AS count
--   FROM downloads
--   WHERE downloaded_at >= NOW() - INTERVAL 7 DAY
--   GROUP BY DATE(downloaded_at)
--   ORDER BY date;
CREATE INDEX idx_downloads_downloaded_at
    ON downloads (downloaded_at)
    COMMENT 'Supports admin dashboard weekly download analytics';

