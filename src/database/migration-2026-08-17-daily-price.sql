-- ============================================================================
-- Add daily_price table  (2026-08-17)
-- Target DB: TiDB Cloud (stock_sphere / test)
--
-- Purpose: stores per-stock daily OHLC ingested from TWSE MI_INDEX, used to
--          compute Bollinger Bands for the "touch lower band" screener.
--
-- ADDITIVE ONLY — creates one new table. No data loss. Reversible with:
--   DROP TABLE `daily_price`;
-- ============================================================================

CREATE TABLE IF NOT EXISTS `daily_price` (
  `id`         INT           NOT NULL AUTO_INCREMENT,
  `stock_id`   VARCHAR(10)   NOT NULL,
  `trade_date` DATE          NOT NULL,
  `open`       DECIMAL(12,4) NULL,
  `high`       DECIMAL(12,4) NULL,
  `low`        DECIMAL(12,4) NULL,
  `close`      DECIMAL(12,4) NULL,
  `volume`     BIGINT        NULL,
  `created_at` TIMESTAMP(0)  NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `daily_price_key` (`stock_id`, `trade_date`),
  INDEX `daily_price_trade_date_idx` (`trade_date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
