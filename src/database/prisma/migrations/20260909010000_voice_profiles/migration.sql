CREATE TABLE `voice_profile_assets` (
  `user_id` INT NOT NULL,
  `mime_type` VARCHAR(80) NOT NULL,
  `byte_size` INT NOT NULL,
  `duration_ms` INT NOT NULL,
  `sha256` CHAR(64) NOT NULL,
  `audio_data` LONGBLOB NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `voice_profile_assets_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);
