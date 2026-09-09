ALTER TABLE `users`
  ADD COLUMN `is_test_account` BOOLEAN NOT NULL DEFAULT FALSE AFTER `is_banned`;

UPDATE `users`
SET `is_test_account` = TRUE
WHERE `user_id` IN (1, 30001);

CREATE INDEX `users_test_account_idx` ON `users` (`is_test_account`);
