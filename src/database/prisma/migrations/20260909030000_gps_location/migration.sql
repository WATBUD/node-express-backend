ALTER TABLE `user_profiles`
  ADD COLUMN `location_accuracy_meters` DECIMAL(8,2) NULL AFTER `longitude`,
  ADD COLUMN `location_updated_at` DATETIME(3) NULL AFTER `location_accuracy_meters`;

CREATE INDEX `user_profiles_location_updated_at_idx`
  ON `user_profiles` (`location_updated_at`);
