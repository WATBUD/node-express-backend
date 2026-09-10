CREATE TABLE `safety_reports` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reporter_user_id` INTEGER NOT NULL,
  `reported_user_id` INTEGER NOT NULL,
  `reason_code` VARCHAR(32) NOT NULL,
  `note` VARCHAR(500) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` DATETIME(0) NULL,
  INDEX `safety_reports_reporter_created_idx` (`reporter_user_id`, `created_at`),
  INDEX `safety_reports_reported_status_created_idx` (`reported_user_id`, `status`, `created_at`),
  INDEX `safety_reports_reason_status_created_idx` (`reason_code`, `status`, `created_at`),
  CONSTRAINT `safety_reports_reporter_fk` FOREIGN KEY (`reporter_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `safety_reports_reported_fk` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
