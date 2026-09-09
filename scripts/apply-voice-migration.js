import fs from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'

const migrationUrl = new URL(
  '../src/database/prisma/migrations/20260908170000_voice_invites/migration.sql',
  import.meta.url,
)
const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })

try {
  const tables = await db.$queryRawUnsafe(`
    SELECT TABLE_NAME AS table_name
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('voice_invites', 'voice_recording_assets')`)
  if (tables.length === 2) {
    console.log('INI voice tables already exist; nothing to apply.')
    process.exitCode = 0
  } else if (tables.length !== 0) {
    throw new Error('Partial voice schema detected. Resolve it before retrying.')
  } else {
    const sql = await fs.readFile(migrationUrl, 'utf8')
    const statements = sql.split(';').map(value => value.trim()).filter(Boolean)
    for (const statement of statements) await db.$executeRawUnsafe(statement)
    console.log('INI voice migration applied successfully.')
  }
} finally {
  await db.$disconnect()
}
