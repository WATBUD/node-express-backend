import fs from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'

const prisma = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })

try {
  const rows = await prisma.$queryRaw`SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'voice_profile_assets'`
  if (Number(rows[0].count) > 0) {
    console.log('voice_profile_assets already exists; nothing to apply.')
  } else {
    const sql = await fs.readFile(
      new URL('../src/database/prisma/migrations/20260909010000_voice_profiles/migration.sql', import.meta.url),
      'utf8',
    )
    await prisma.$executeRawUnsafe(sql)
    console.log('Applied voice profile migration to INI Dating database.')
  }
} finally {
  await prisma.$disconnect()
}
