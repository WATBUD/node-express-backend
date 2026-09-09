ALTER TABLE `voice_invites`
  ADD UNIQUE KEY `voice_invites_pair_status_unique` (`sender_user_id`, `recipient_user_id`, `status`);
