import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../database/database-urls.js'
import { showIniTestData } from '../config/runtime-config.js'

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })

const numberId = value => Number(value)

export default {
  async findUser(userId) {
    const rows = await db.$queryRaw`SELECT user_id FROM users WHERE user_id = ${numberId(userId)} AND is_banned = FALSE AND (${showIniTestData} OR is_test_account = FALSE) LIMIT 1`
    return rows[0] ?? null
  },

  async discover(userId) {
    return db.$queryRaw`
      SELECT u.user_id AS id, p.display_name AS name,
             COALESCE(NULLIF(p.avatar_id, ''), CASE WHEN p.gender = 'female' THEN 'moon-cat' ELSE 'star-dragon' END) AS image,
             p.gender, p.birthdate, p.location, COALESCE(p.city, p.location) AS city,
             p.headline, p.bio, u.last_active_at,
             CASE
               WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL
                 AND viewer.latitude IS NOT NULL AND viewer.longitude IS NOT NULL
               THEN ROUND(6371 * ACOS(LEAST(1,
                 COS(RADIANS(viewer.latitude)) * COS(RADIANS(p.latitude))
                 * COS(RADIANS(p.longitude) - RADIANS(viewer.longitude))
                 + SIN(RADIANS(viewer.latitude)) * SIN(RADIANS(p.latitude))
               )), 1)
               WHEN COALESCE(p.city, p.location) = COALESCE(viewer.city, viewer.location) THEN 0
               ELSE NULL
             END AS distance_km,
             vp.duration_ms AS voice_duration_ms
      FROM users u
      JOIN user_profiles p ON p.user_id = u.user_id
      JOIN voice_profile_assets vp ON vp.user_id = u.user_id
      JOIN user_profiles viewer ON viewer.user_id = ${numberId(userId)}
      WHERE u.user_id <> ${numberId(userId)} AND u.is_banned = FALSE
        AND (${showIniTestData} OR u.is_test_account = FALSE)
        AND NOT EXISTS (
          SELECT 1 FROM voice_invites v
          WHERE v.sender_user_id = ${numberId(userId)}
            AND v.recipient_user_id = u.user_id
            AND v.status = 'pending'
        )
        AND NOT EXISTS (
          SELECT 1 FROM connections c
          WHERE c.user_low_id = LEAST(${numberId(userId)}, u.user_id)
            AND c.user_high_id = GREATEST(${numberId(userId)}, u.user_id)
        )
      ORDER BY p.updated_at DESC, u.user_id DESC
      LIMIT 100`
  },

  async upsertProfileVoice({ userId, durationMs, mimeType, bytes, sha256 }) {
    await db.$executeRaw`
      INSERT INTO voice_profile_assets (user_id, mime_type, byte_size, duration_ms, sha256, audio_data)
      VALUES (${numberId(userId)}, ${mimeType}, ${bytes.length}, ${durationMs}, ${sha256}, ${bytes})
      ON DUPLICATE KEY UPDATE mime_type = VALUES(mime_type), byte_size = VALUES(byte_size),
        duration_ms = VALUES(duration_ms), sha256 = VALUES(sha256), audio_data = VALUES(audio_data),
        updated_at = CURRENT_TIMESTAMP`
    return { userId: numberId(userId), durationMs }
  },

  async getProfileVoice(userId) {
    const rows = await db.$queryRaw`
      SELECT vp.user_id, vp.mime_type, vp.byte_size, vp.duration_ms, vp.audio_data
      FROM voice_profile_assets vp
      JOIN users u ON u.user_id = vp.user_id
      WHERE vp.user_id = ${numberId(userId)} AND u.is_banned = FALSE
        AND (${showIniTestData} OR u.is_test_account = FALSE)
      LIMIT 1`
    return rows[0] ?? null
  },

  async create({ senderUserId, recipientUserId, durationMs, mimeType, bytes, sha256 }) {
    try {
      return await db.$transaction(async tx => {
      const existing = await tx.$queryRaw`
        SELECT id FROM voice_invites
        WHERE sender_user_id = ${numberId(senderUserId)}
          AND recipient_user_id = ${numberId(recipientUserId)}
          AND status = 'pending'
        LIMIT 1 FOR UPDATE`
      if (existing.length) return { duplicateId: numberId(existing[0].id) }
      await tx.$executeRaw`
        INSERT INTO voice_invites (sender_user_id, recipient_user_id, status, duration_ms)
        VALUES (${numberId(senderUserId)}, ${numberId(recipientUserId)}, 'pending', ${durationMs})`
      const ids = await tx.$queryRaw`SELECT LAST_INSERT_ID() AS id`
      const id = numberId(ids[0].id)
      await tx.$executeRaw`
        INSERT INTO voice_recording_assets (voice_invite_id, mime_type, byte_size, sha256, audio_data)
        VALUES (${id}, ${mimeType}, ${bytes.length}, ${sha256}, ${bytes})`
      return { id }
      })
    } catch (error) {
      if (error?.code === 'P2002') return { duplicateId: -1 }
      throw error
    }
  },

  async list(userId, box) {
    const ownerColumn = box === 'inbox' ? 'v.recipient_user_id' : 'v.sender_user_id'
    const peerColumn = box === 'inbox' ? 'v.sender_user_id' : 'v.recipient_user_id'
    return db.$queryRawUnsafe(`
      SELECT v.id, v.status, v.duration_ms, v.created_at, v.reviewed_at,
             u.user_id AS user_id, p.display_name AS name, p.avatar_id AS image,
             p.gender, p.location, p.headline, p.bio,
             a.mime_type, a.byte_size
      FROM voice_invites v
      JOIN users u ON u.user_id = ${peerColumn}
      JOIN user_profiles p ON p.user_id = u.user_id
      JOIN voice_recording_assets a ON a.voice_invite_id = v.id
      WHERE ${ownerColumn} = ? AND v.status <> 'cancelled'
        AND ${showIniTestData ? 'TRUE' : 'u.is_test_account = FALSE'}
      ORDER BY v.created_at DESC
      LIMIT 100`, numberId(userId))
  },

  async getAccessible(inviteId, userId) {
    const rows = await db.$queryRaw`
      SELECT v.id, v.sender_user_id, v.recipient_user_id, v.status,
             a.mime_type, a.byte_size, a.audio_data
      FROM voice_invites v
      JOIN voice_recording_assets a ON a.voice_invite_id = v.id
      WHERE v.id = ${numberId(inviteId)}
        AND (v.sender_user_id = ${numberId(userId)} OR v.recipient_user_id = ${numberId(userId)})
        AND v.status <> 'cancelled'
      LIMIT 1`
    return rows[0] ?? null
  },

  async cancel(inviteId, senderUserId) {
    return db.$executeRaw`
      DELETE FROM voice_invites
      WHERE id = ${numberId(inviteId)} AND sender_user_id = ${numberId(senderUserId)} AND status = 'pending'`
  },

  async review(inviteId, recipientUserId, status) {
    return db.$transaction(async tx => {
      if (status === 'rejected') {
        return tx.$executeRaw`
          DELETE FROM voice_invites
          WHERE id = ${numberId(inviteId)} AND recipient_user_id = ${numberId(recipientUserId)} AND status = 'pending'`
      }
      const changed = await tx.$executeRaw`
        UPDATE voice_invites SET status = ${status}, reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ${numberId(inviteId)} AND recipient_user_id = ${numberId(recipientUserId)} AND status = 'pending'`
      if (changed && status === 'approved') {
        const rows = await tx.$queryRaw`SELECT sender_user_id, recipient_user_id FROM voice_invites WHERE id = ${numberId(inviteId)} LIMIT 1`
        const low = Math.min(numberId(rows[0].sender_user_id), numberId(rows[0].recipient_user_id))
        const high = Math.max(numberId(rows[0].sender_user_id), numberId(rows[0].recipient_user_id))
        await tx.$executeRaw`
          INSERT INTO connections (user_low_id, user_high_id, source, source_invite_id)
          VALUES (${low}, ${high}, 'voice', ${numberId(inviteId)})
          ON DUPLICATE KEY UPDATE source = VALUES(source), source_invite_id = VALUES(source_invite_id)`
      }
      return changed
    })
  },
}
