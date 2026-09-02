-- Gender is an account-level required field. Stable English codes keep API and
-- database values independent from the app display language.
ALTER TABLE `users`
  ADD COLUMN `gender` VARCHAR(6) NOT NULL DEFAULT 'female',
  ADD COLUMN `gender_changed_at` DATETIME(3) NULL;

-- The default only backfills existing accounts. New registrations must provide it.
ALTER TABLE `users`
  ALTER COLUMN `gender` DROP DEFAULT;
