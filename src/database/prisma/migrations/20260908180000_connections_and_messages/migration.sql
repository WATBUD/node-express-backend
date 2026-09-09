CREATE TABLE `connections` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_low_id` INT NOT NULL,
  `user_high_id` INT NOT NULL,
  `source` VARCHAR(16) NOT NULL,
  `source_invite_id` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `connections_user_pair` (`user_low_id`, `user_high_id`),
  KEY `connections_high_user` (`user_high_id`),
  CONSTRAINT `connections_low_user_fk` FOREIGN KEY (`user_low_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `connections_high_user_fk` FOREIGN KEY (`user_high_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `connections_voice_invite_fk` FOREIGN KEY (`source_invite_id`) REFERENCES `voice_invites` (`id`) ON DELETE SET NULL,
  CONSTRAINT `connections_distinct_users` CHECK (`user_low_id` < `user_high_id`)
);

CREATE TABLE `chat_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `connection_id` INT NOT NULL,
  `sender_user_id` INT NOT NULL,
  `body` VARCHAR(1000) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `chat_messages_connection_created` (`connection_id`, `created_at`, `id`),
  CONSTRAINT `chat_messages_connection_fk` FOREIGN KEY (`connection_id`) REFERENCES `connections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_sender_fk` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);
