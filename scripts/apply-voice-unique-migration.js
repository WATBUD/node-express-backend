import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })
try {
  const rows = await db.$queryRawUnsafe(`SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'voice_invites' AND INDEX_NAME = 'voice_invites_pair_status_unique'`)
  if (rows.length) console.log('INI voice uniqueness constraint already exists; nothing to apply.')
  else {
    await db.$executeRawUnsafe('ALTER TABLE voice_invites ADD UNIQUE KEY voice_invites_pair_status_unique (sender_user_id, recipient_user_id, status)')
    console.log('INI voice uniqueness migration applied successfully.')
  }
} finally { await db.$disconnect() }
