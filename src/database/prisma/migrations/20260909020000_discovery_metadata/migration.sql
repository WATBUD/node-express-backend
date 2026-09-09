ALTER TABLE `users`
  ADD COLUMN `last_active_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `updated_at`;

ALTER TABLE `user_profiles`
  ADD COLUMN `city` VARCHAR(50) NULL AFTER `location`,
  ADD COLUMN `latitude` DECIMAL(9,6) NULL AFTER `city`,
  ADD COLUMN `longitude` DECIMAL(9,6) NULL AFTER `latitude`;

UPDATE `user_profiles`
SET `city` = NULLIF(TRIM(`location`), ''),
    `latitude` = CASE
      WHEN `location` = '台北市' THEN 25.033000
      WHEN `location` = '新北市' THEN 25.016983
      WHEN `location` = '桃園市' THEN 24.993628
      WHEN `location` = '台中市' THEN 24.147736
      ELSE NULL
    END,
    `longitude` = CASE
      WHEN `location` = '台北市' THEN 121.565400
      WHEN `location` = '新北市' THEN 121.462787
      WHEN `location` = '桃園市' THEN 121.301014
      WHEN `location` = '台中市' THEN 120.673648
      ELSE NULL
    END;

CREATE INDEX `users_last_active_at_idx` ON `users` (`last_active_at`);
CREATE INDEX `user_profiles_city_idx` ON `user_profiles` (`city`);
