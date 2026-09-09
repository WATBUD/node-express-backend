import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'

const prisma = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })

try {
  const columns = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'is_test_account'",
  )
  if (!Number(columns[0].count)) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `users` ADD COLUMN `is_test_account` BOOLEAN NOT NULL DEFAULT FALSE AFTER `is_banned`',
    )
  }
  await prisma.$executeRawUnsafe(
    'UPDATE `users` SET `is_test_account` = TRUE WHERE `user_id` IN (1, 30001)',
  )
  const indexes = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS count FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'users_test_account_idx'",
  )
  if (!Number(indexes[0].count)) {
    await prisma.$executeRawUnsafe(
      'CREATE INDEX `users_test_account_idx` ON `users` (`is_test_account`)',
    )
  }
  console.log('Test-account migration is complete for the INI Dating database.')
} finally {
  await prisma.$disconnect()
}
