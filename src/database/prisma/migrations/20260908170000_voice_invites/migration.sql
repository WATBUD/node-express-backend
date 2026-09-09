CREATE TABLE `voice_invites` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sender_user_id` INT NOT NULL,
  `recipient_user_id` INT NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'pending',
  `duration_ms` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` TIMESTAMP NULL,
  `cancelled_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `voice_invites_sender_status` (`sender_user_id`, `status`, `created_at`),
  KEY `voice_invites_recipient_status` (`recipient_user_id`, `status`, `created_at`),
  CONSTRAINT `voice_invites_sender_fk` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `voice_invites_recipient_fk` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `voice_invites_distinct_users` CHECK (`sender_user_id` <> `recipient_user_id`),
  CONSTRAINT `voice_invites_status` CHECK (`status` IN ('pending', 'approved', 'rejected', 'cancelled'))
);

CREATE TABLE `voice_recording_assets` (
  `voice_invite_id` INT NOT NULL,
  `mime_type` VARCHAR(80) NOT NULL,
  `byte_size` INT NOT NULL,
  `sha256` CHAR(64) NOT NULL,
  `audio_data` LONGBLOB NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`voice_invite_id`),
  CONSTRAINT `voice_recording_assets_invite_fk` FOREIGN KEY (`voice_invite_id`) REFERENCES `voice_invites` (`id`) ON DELETE CASCADE
);
