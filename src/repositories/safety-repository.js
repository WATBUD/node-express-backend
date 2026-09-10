import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../database/database-urls.js'

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })

export default {
  async userExists(userId) {
    const rows = await db.$queryRaw`SELECT user_id FROM users WHERE user_id = ${Number(userId)} AND is_banned = FALSE LIMIT 1`
    return rows.length > 0
  },
  async createReport(reporterUserId, reportedUserId, reasonCode, note) {
    await db.$executeRaw`INSERT INTO safety_reports (reporter_user_id, reported_user_id, reason_code, note) VALUES (${reporterUserId}, ${reportedUserId}, ${reasonCode}, ${note || null})`
    const ids = await db.$queryRaw`SELECT LAST_INSERT_ID() AS id`
    return { id: Number(ids[0].id), status: 'pending', createdAt: new Date().toISOString() }
  },
}
