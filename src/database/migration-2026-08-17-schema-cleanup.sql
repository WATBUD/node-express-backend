-- ============================================================================
-- Schema cleanup migration  (2026-08-17)
-- Target DB: stock_sphere (MySQL)
--
-- REVIEW BEFORE RUNNING. Take a full backup first:
--   mysqldump stock_sphere > stock_sphere_backup_2026-08-17.sql
--
-- Section A = structural correctness fixes (safe; no intentional data loss).
-- Section B = DESTRUCTIVE cleanup of leftover dating-app columns/tables
--             (DROPs data permanently). Run ONLY if you don't need that data.
-- Run Section A first and verify the app before touching Section B.
-- ============================================================================


-- ============================================================================
-- SECTION A — user_stock structural fixes
-- ============================================================================

-- Preflight: these must both return 0 rows, otherwise the steps below fail.
--   A1) non-numeric user_id values (would break the INT conversion):
--       SELECT * FROM user_stock WHERE user_id NOT REGEXP '^[0-9]+$';
--   A2) orphan rows with no matching user (would break the foreign key):
--       SELECT us.* FROM user_stock us
--         LEFT JOIN users u ON u.user_id = CAST(us.user_id AS UNSIGNED)
--         WHERE u.user_id IS NULL;
-- Clean up any rows the two queries return before continuing.

-- A3) Rename primary key column `index` -> `id` (keeps PK + AUTO_INCREMENT).
ALTER TABLE `user_stock`
  CHANGE COLUMN `index` `id` INT NOT NULL AUTO_INCREMENT;

-- A4) Widen note (was VARCHAR(16) — too short, caused "too long" errors).
ALTER TABLE `user_stock`
  MODIFY COLUMN `note` VARCHAR(255) NULL;

-- A5) Widen stock_id (some ETF/warrant codes exceed 6 chars).
ALTER TABLE `user_stock`
  MODIFY COLUMN `stock_id` VARCHAR(10) NOT NULL;

-- A6) Convert user_id VARCHAR(16) -> INT so it matches users.user_id.
ALTER TABLE `user_stock`
  MODIFY COLUMN `user_id` INT NOT NULL;

-- A7) Add created_at (table previously only tracked updated_at).
ALTER TABLE `user_stock`
  ADD COLUMN `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0) AFTER `user_id`;

-- A8) Index on user_id (needed to back the foreign key; the existing
--     composite unique starts with stock_id so it can't serve the FK).
ALTER TABLE `user_stock`
  ADD INDEX `user_stock_user_id_idx` (`user_id`);

-- A9) Referential integrity: link user_stock -> users, cascade on user delete.
ALTER TABLE `user_stock`
  ADD CONSTRAINT `user_stock_user_fk`
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
  ON DELETE CASCADE ON UPDATE NO ACTION;


-- ============================================================================
-- SECTION B — DESTRUCTIVE: remove leftover dating-app schema
-- These columns/tables are unused by the stock-tracking app. Dropping them
-- PERMANENTLY DELETES their data. Confirm you don't need it before running.
-- ============================================================================

-- B1) Drop dating-specific columns from `users`.
--     (Keeps: user_id, user_account, username, password_hash, email,
--      created_at, updated_at, is_banned, avatar.)
ALTER TABLE `users`
  DROP COLUMN `gender`,
  DROP COLUMN `birthday`,
  DROP COLUMN `user_has_tag`,
  DROP COLUMN `profile_picture`,
  DROP COLUMN `interests`,
  DROP COLUMN `personal_description`,
  DROP COLUMN `location`,
  DROP COLUMN `relationship_status`,
  DROP COLUMN `looking_for`,
  DROP COLUMN `privacy_settings`,
  DROP COLUMN `social_links`;

-- B2) Drop leftover dating-app tables (unused by any code path).
DROP TABLE IF EXISTS `all_tags`;
DROP TABLE IF EXISTS `all_tags_group`;
DROP TABLE IF EXISTS `chat_messages`;
