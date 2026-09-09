import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'

const prisma = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })

const hasColumn = async (table, column) => {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
    table,
    column,
  )
  return Number(rows[0].count) > 0
}

const hasIndex = async (table, index) => {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*) AS count FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?',
    table,
    index,
  )
  return Number(rows[0].count) > 0
}

try {
  if (!(await hasColumn('users', 'last_active_at'))) {
    await prisma.$executeRawUnsafe('ALTER TABLE `users` ADD COLUMN `last_active_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `updated_at`')
  }
  if (!(await hasColumn('user_profiles', 'city'))) {
    await prisma.$executeRawUnsafe('ALTER TABLE `user_profiles` ADD COLUMN `city` VARCHAR(50) NULL AFTER `location`')
  }
  if (!(await hasColumn('user_profiles', 'latitude'))) {
    await prisma.$executeRawUnsafe('ALTER TABLE `user_profiles` ADD COLUMN `latitude` DECIMAL(9,6) NULL AFTER `city`')
  }
  if (!(await hasColumn('user_profiles', 'longitude'))) {
    await prisma.$executeRawUnsafe('ALTER TABLE `user_profiles` ADD COLUMN `longitude` DECIMAL(9,6) NULL AFTER `latitude`')
  }
  await prisma.$executeRawUnsafe(`UPDATE user_profiles
    SET city = NULLIF(TRIM(location), ''),
        latitude = CASE location
          WHEN '台北市' THEN 25.033000 WHEN '新北市' THEN 25.016983
          WHEN '桃園市' THEN 24.993628 WHEN '台中市' THEN 24.147736
          WHEN '台南市' THEN 22.999900 WHEN '高雄市' THEN 22.627300
          ELSE latitude END,
        longitude = CASE location
          WHEN '台北市' THEN 121.565400 WHEN '新北市' THEN 121.462787
          WHEN '桃園市' THEN 121.301014 WHEN '台中市' THEN 120.673648
          WHEN '台南市' THEN 120.227000 WHEN '高雄市' THEN 120.301400
          ELSE longitude END
    WHERE city IS NULL OR city = ''`)
  if (!(await hasIndex('users', 'users_last_active_at_idx'))) {
    await prisma.$executeRawUnsafe('CREATE INDEX `users_last_active_at_idx` ON `users` (`last_active_at`)')
  }
  if (!(await hasIndex('user_profiles', 'user_profiles_city_idx'))) {
    await prisma.$executeRawUnsafe('CREATE INDEX `user_profiles_city_idx` ON `user_profiles` (`city`)')
  }
  console.log('Discovery metadata migration is complete for the INI Dating database.')
} finally {
  await prisma.$disconnect()
}
