import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../database/database-urls.js'
import { showIniTestData } from '../config/runtime-config.js'

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })
const numberId = value => Number(value)

export default {
  async threads(userId) {
    return db.$queryRaw`
      SELECT c.id AS connection_id, c.source, c.created_at,
             u.user_id, p.display_name AS name,
             COALESCE(NULLIF(p.avatar_id, ''), CASE WHEN p.gender = 'female' THEN 'moon-cat' ELSE 'star-dragon' END) AS image,
             p.gender, p.headline,
             (SELECT m.body FROM chat_messages m WHERE m.connection_id = c.id AND m.deleted_at IS NULL ORDER BY m.created_at DESC, m.id DESC LIMIT 1) AS last_message,
             (SELECT m.created_at FROM chat_messages m WHERE m.connection_id = c.id AND m.deleted_at IS NULL ORDER BY m.created_at DESC, m.id DESC LIMIT 1) AS last_message_at
      FROM connections c
      JOIN users u ON u.user_id = CASE WHEN c.user_low_id = ${numberId(userId)} THEN c.user_high_id ELSE c.user_low_id END
      JOIN user_profiles p ON p.user_id = u.user_id
      WHERE (c.user_low_id = ${numberId(userId)} OR c.user_high_id = ${numberId(userId)}) AND u.is_banned = FALSE
        AND (${showIniTestData} OR u.is_test_account = FALSE)
      ORDER BY COALESCE(last_message_at, c.created_at) DESC`
  },

  async connection(userId, peerUserId) {
    const low = Math.min(numberId(userId), numberId(peerUserId))
    const high = Math.max(numberId(userId), numberId(peerUserId))
    const rows = await db.$queryRaw`SELECT id FROM connections WHERE user_low_id = ${low} AND user_high_id = ${high} LIMIT 1`
    return rows[0] ?? null
  },

  async messages(connectionId, limit = 100) {
    return db.$queryRaw`
      SELECT id, sender_user_id, body, created_at
      FROM chat_messages
      WHERE connection_id = ${numberId(connectionId)} AND deleted_at IS NULL
      ORDER BY created_at ASC, id ASC
      LIMIT ${limit}`
  },

  async send(connectionId, senderUserId, body) {
    await db.$executeRaw`INSERT INTO chat_messages (connection_id, sender_user_id, body) VALUES (${numberId(connectionId)}, ${numberId(senderUserId)}, ${body})`
    const ids = await db.$queryRaw`SELECT LAST_INSERT_ID() AS id`
    return { id: numberId(ids[0].id), sender_user_id: numberId(senderUserId), body, created_at: new Date() }
  },
}
