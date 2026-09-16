import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })
try {
  const columns = await db.$queryRaw`
    SELECT COLUMN_NAME FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'chat_messages' AND COLUMN_NAME = 'client_message_id'`
  if (!columns.length) await db.$executeRawUnsafe('ALTER TABLE chat_messages ADD COLUMN client_message_id VARCHAR(64) NULL AFTER body')

  const indexes = await db.$queryRaw`
    SELECT INDEX_NAME FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'chat_messages' AND INDEX_NAME = 'uq_chat_client_message'`
  if (!indexes.length) await db.$executeRawUnsafe('ALTER TABLE chat_messages ADD UNIQUE KEY uq_chat_client_message (connection_id, sender_user_id, client_message_id)')
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS push_devices (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(512) NOT NULL,
    platform VARCHAR(16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_push_token (token),
    KEY idx_push_user (user_id),
    CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)
  console.log('Realtime chat schema ready')
} finally {
  await db.$disconnect()
}
