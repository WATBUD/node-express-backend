import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../database/database-urls.js'

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })

export default {
  async register(userId, token, platform) {
    await db.$executeRaw`
      INSERT INTO push_devices (user_id, token, platform)
      VALUES (${Number(userId)}, ${token}, ${platform})
      ON DUPLICATE KEY UPDATE user_id=VALUES(user_id), platform=VALUES(platform), updated_at=CURRENT_TIMESTAMP`
  },
  async remove(userId, token) {
    await db.$executeRaw`DELETE FROM push_devices WHERE user_id=${Number(userId)} AND token=${token}`
  },
  async tokens(userId) {
    return db.$queryRaw`SELECT token FROM push_devices WHERE user_id=${Number(userId)}`
  },
  async removeToken(token) {
    await db.$executeRaw`DELETE FROM push_devices WHERE token=${token}`
  },
}
