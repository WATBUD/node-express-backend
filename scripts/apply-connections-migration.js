import fs from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'

const migrationUrl = new URL('../src/database/prisma/migrations/20260908180000_connections_and_messages/migration.sql', import.meta.url)
const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })
try {
  const rows = await db.$queryRawUnsafe(`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('connections', 'chat_messages')`)
  if (rows.length === 2) console.log('INI connection tables already exist; nothing to apply.')
  else if (rows.length) throw new Error('Partial connection schema detected. Resolve it before retrying.')
  else {
    const statements = (await fs.readFile(migrationUrl, 'utf8')).split(';').map(value => value.trim()).filter(Boolean)
    for (const statement of statements) await db.$executeRawUnsafe(statement)
    console.log('INI connection migration applied successfully.')
  }
} finally { await db.$disconnect() }
