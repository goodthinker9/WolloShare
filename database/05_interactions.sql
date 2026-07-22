-- =====================================================
-- Migration 05: Resource interactions and moderation
-- =====================================================

USE wolloshare;

-- Downloads track user access to resources and support future analytics.
CREATE TABLE IF NOT EXISTS downloads (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    resource_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    downloaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_downloads_resource_id (resource_id),
    KEY idx_downloads_user_id (user_id),
    CONSTRAINT fk_downloads_resource
        FOREIGN KEY (resource_id) REFERENCES resources (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_downloads_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookmarks let users save resources for later access.
CREATE TABLE IF NOT EXISTS bookmarks (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    resource_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_bookmarks_resource_user (resource_id, user_id),
    KEY idx_bookmarks_user_id (user_id),
    CONSTRAINT fk_bookmarks_resource
        FOREIGN KEY (resource_id) REFERENCES resources (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_bookmarks_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ratings capture user feedback for resources and support quality signals.
CREATE TABLE IF NOT EXISTS ratings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    resource_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_ratings_resource_user (resource_id, user_id),
    KEY idx_ratings_resource_id (resource_id),
    CONSTRAINT fk_ratings_resource
        FOREIGN KEY (resource_id) REFERENCES resources (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ratings_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_ratings_rating_range
        CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports support moderation and safety review for inappropriate content.
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    resource_id BIGINT UNSIGNED NOT NULL,
    reported_by BIGINT UNSIGNED NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'reviewed', 'resolved') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_reports_status_created (status, created_at),
    CONSTRAINT fk_reports_resource
        FOREIGN KEY (resource_id) REFERENCES resources (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reports_reported_by
        FOREIGN KEY (reported_by) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
