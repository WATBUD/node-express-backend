CREATE TABLE `user_profiles` (
  `user_id` INT NOT NULL,
  `display_name` VARCHAR(50) NOT NULL,
  `birthdate` DATE NULL,
  `gender` VARCHAR(6) NOT NULL,
  `gender_changed_at` DATETIME(3) NULL,
  `avatar_id` VARCHAR(255) NULL,
  `location` VARCHAR(100) NULL,
  `headline` VARCHAR(100) NULL,
  `bio` VARCHAR(200) NULL,
  `zodiac` VARCHAR(20) NULL,
  `relationship` VARCHAR(30) NULL,
  `looking_for` VARCHAR(30) NULL,
  `profile_initialized` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_profiles_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

CREATE TABLE `user_profile_options` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `option_type` VARCHAR(12) NOT NULL,
  `option_key` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_profile_option_unique` (`user_id`, `option_type`, `option_key`),
  KEY `user_profile_option_lookup` (`option_type`, `option_key`),
  CONSTRAINT `user_profile_options_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

CREATE TABLE `user_custom_options` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `option_type` VARCHAR(12) NOT NULL,
  `value` VARCHAR(20) NOT NULL,
  `normalized_value` VARCHAR(20) NOT NULL,
  `moderation_status` VARCHAR(16) NOT NULL DEFAULT 'approved',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_custom_option_unique` (`user_id`, `option_type`, `normalized_value`),
  KEY `user_custom_option_popularity` (`option_type`, `normalized_value`, `moderation_status`),
  CONSTRAINT `user_custom_options_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

INSERT INTO `user_profiles` (
  `user_id`, `display_name`, `birthdate`, `gender`, `gender_changed_at`,
  `avatar_id`, `location`, `headline`, `bio`, `zodiac`, `relationship`,
  `looking_for`, `profile_initialized`, `created_at`, `updated_at`
)
SELECT
  `user_id`, `username`, `birthdate`, `gender`, `gender_changed_at`,
  `avatar`, `location`, `headline`, `bio`, `zodiac`, `relationship`,
  `looking_for`, `profile_initialized`, `created_at`, `updated_at`
FROM `users`;

INSERT INTO `user_profile_options` (`user_id`, `option_type`, `option_key`)
SELECT u.`user_id`, 'tag', item.`option_key`
FROM `users` u
JOIN JSON_TABLE(COALESCE(u.`tags`, JSON_ARRAY()), '$[*]' COLUMNS (`option_key` VARCHAR(50) PATH '$')) item;

INSERT INTO `user_profile_options` (`user_id`, `option_type`, `option_key`)
SELECT u.`user_id`, 'interest', item.`option_key`
FROM `users` u
JOIN JSON_TABLE(COALESCE(u.`interests`, JSON_ARRAY()), '$[*]' COLUMNS (`option_key` VARCHAR(50) PATH '$')) item;

INSERT INTO `user_custom_options` (`user_id`, `option_type`, `value`, `normalized_value`)
SELECT u.`user_id`, 'tag', item.`value`, LOWER(item.`value`)
FROM `users` u
JOIN JSON_TABLE(COALESCE(u.`custom_tags`, JSON_ARRAY()), '$[*]' COLUMNS (`value` VARCHAR(20) PATH '$')) item;

INSERT INTO `user_custom_options` (`user_id`, `option_type`, `value`, `normalized_value`)
SELECT u.`user_id`, 'interest', item.`value`, LOWER(item.`value`)
FROM `users` u
JOIN JSON_TABLE(COALESCE(u.`custom_interests`, JSON_ARRAY()), '$[*]' COLUMNS (`value` VARCHAR(20) PATH '$')) item;

ALTER TABLE `users`
  DROP COLUMN `username`,
  DROP COLUMN `birthdate`,
  DROP COLUMN `gender`,
  DROP COLUMN `gender_changed_at`,
  DROP COLUMN `avatar`,
  DROP COLUMN `location`,
  DROP COLUMN `headline`,
  DROP COLUMN `bio`,
  DROP COLUMN `tags`,
  DROP COLUMN `interests`,
  DROP COLUMN `custom_tags`,
  DROP COLUMN `custom_interests`,
  DROP COLUMN `zodiac`,
  DROP COLUMN `relationship`,
  DROP COLUMN `looking_for`,
  DROP COLUMN `profile_initialized`;
