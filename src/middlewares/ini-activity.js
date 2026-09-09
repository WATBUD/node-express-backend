import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../database/database-urls.js'

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })

/**
 * Keep discovery presence useful without writing on every single request.
 * A user is considered online for five minutes, so one update per minute is enough.
 */
export const trackIniActivity = async (req, _res, next) => {
  const userId = Number(req.user?.user_id)
  if (!Number.isInteger(userId) || userId <= 0) return next()
  try {
    await db.$executeRaw`
      UPDATE users SET last_active_at = CURRENT_TIMESTAMP(3)
      WHERE user_id = ${userId}
        AND (last_active_at IS NULL OR last_active_at < CURRENT_TIMESTAMP(3) - INTERVAL 1 MINUTE)`
  } catch (error) {
    console.warn('[activity] Could not update last_active_at:', error.code || error.message)
  }
  next()
}
