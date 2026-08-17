-- ============================================================================
-- Add stock master table  (2026-08-17)
-- Target DB: TiDB Cloud (test)
--
-- Purpose: single source of truth for stock_id -> name, so the tracking list
--          (and other features) can show names via a cheap PK lookup instead
--          of scanning the large daily_price table.
--
-- ADDITIVE ONLY — creates one new table + seeds it from existing daily_price.
-- Reversible with:  DROP TABLE `stock`;
-- ============================================================================

CREATE TABLE IF NOT EXISTS `stock` (
  `stock_id`   VARCHAR(10)  NOT NULL,
  `name`       VARCHAR(50)  NULL,
  `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`stock_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- One-time seed: latest known name per stock_id from daily_price.
INSERT INTO `stock` (`stock_id`, `name`)
SELECT dp.`stock_id`, dp.`name`
FROM `daily_price` dp
JOIN (
  SELECT `stock_id`, MAX(`trade_date`) AS mx
  FROM `daily_price`
  GROUP BY `stock_id`
) t ON t.`stock_id` = dp.`stock_id` AND t.mx = dp.`trade_date`
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
