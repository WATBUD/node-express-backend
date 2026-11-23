-- Survival Equation（生存方程）遊戲帳號資料表
-- Database：survival_equation（由 DATABASE_URL 衍生，與 ini_dating、watchlab 完全分離）
CREATE TABLE IF NOT EXISTS se_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  account VARCHAR(32) NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  nickname VARCHAR(20) NOT NULL,
  auth_token_version INT NOT NULL DEFAULT 0,
  is_banned TINYINT(1) NOT NULL DEFAULT 0,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_se_users_account (account)
);
