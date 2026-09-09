import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })
const recipientId = Number(process.env.INI_TEST_USER_ID || 30001)
const people = [
  ['ini.voice.fixture.1@test.invalid', '語音旅人', 'female', 'female-lantern-fennec'],
  ['ini.voice.fixture.2@test.invalid', '月光小語', 'female', 'female-moon-dragon'],
  ['ini.voice.fixture.3@test.invalid', '森林來信', 'female', 'forest-fox'],
]

try {
  const recipient = await db.$queryRaw`SELECT user_id FROM users WHERE user_id = ${recipientId} LIMIT 1`
  if (!recipient.length) throw new Error(`INI_TEST_USER_ID ${recipientId} does not exist.`)

  let audio = (await db.$queryRaw`
    SELECT mime_type, byte_size, sha256, audio_data, duration_ms
    FROM voice_profile_assets ORDER BY updated_at DESC LIMIT 1`)[0]
  if (!audio) {
    audio = (await db.$queryRaw`
      SELECT a.mime_type, a.byte_size, a.sha256, a.audio_data, v.duration_ms
      FROM voice_recording_assets a
      JOIN voice_invites v ON v.id = a.voice_invite_id
      ORDER BY a.created_at DESC LIMIT 1`)[0]
  }
  if (!audio) throw new Error('No reusable test audio exists. Record one profile voice first.')

  await db.$transaction(async tx => {
    const oldInvites = await tx.$queryRaw`
      SELECT id FROM voice_invites WHERE recipient_user_id = ${recipientId}`
    if (oldInvites.length) {
      const ids = oldInvites.map(row => Number(row.id))
      await tx.$executeRawUnsafe(
        `DELETE FROM connections WHERE source = 'voice' AND source_invite_id IN (${ids.map(() => '?').join(',')})`,
        ...ids,
      )
      await tx.$executeRaw`DELETE FROM voice_invites WHERE recipient_user_id = ${recipientId}`
    }

    for (const [account, name, gender, avatar] of people) {
      await tx.$executeRaw`
        INSERT INTO users (user_account, password_hash, email, phone, created_at, updated_at, is_banned, is_test_account)
        VALUES (${account}, 'PRIVATE_TEST_ACCOUNT_DISABLED', ${account}, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE, TRUE)
        ON DUPLICATE KEY UPDATE is_test_account = TRUE, is_banned = FALSE`
      const rows = await tx.$queryRaw`SELECT user_id FROM users WHERE user_account = ${account} LIMIT 1`
      const senderId = Number(rows[0].user_id)
      await tx.$executeRaw`
        INSERT INTO user_profiles
          (user_id, display_name, birthdate, gender, avatar_id, location, headline, bio, profile_initialized, created_at, updated_at)
        VALUES
          (${senderId}, ${name}, '1998-06-15', ${gender}, ${avatar}, '台北市', '想用聲音認識真實的你',
           '喜歡慢慢聊天，也期待聽見你的故事。', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), gender = VALUES(gender),
          avatar_id = VALUES(avatar_id), location = VALUES(location), headline = VALUES(headline),
          bio = VALUES(bio), profile_initialized = TRUE, updated_at = CURRENT_TIMESTAMP`
      await tx.$executeRaw`
        INSERT INTO voice_invites (sender_user_id, recipient_user_id, status, duration_ms)
        VALUES (${senderId}, ${recipientId}, 'pending', ${Number(audio.duration_ms)})`
      const ids = await tx.$queryRaw`SELECT LAST_INSERT_ID() AS id`
      await tx.$executeRaw`
        INSERT INTO voice_recording_assets (voice_invite_id, mime_type, byte_size, sha256, audio_data)
        VALUES (${Number(ids[0].id)}, ${audio.mime_type}, ${Number(audio.byte_size)}, ${audio.sha256}, ${audio.audio_data})`
    }
  })

  const result = await db.$queryRaw`
    SELECT id, sender_user_id, status, duration_ms
    FROM voice_invites
    WHERE recipient_user_id = ${recipientId}
    ORDER BY created_at DESC`
  console.log(`Private test inbox reset: ${result.length} pending voice invites for user ${recipientId}.`)
} finally {
  await db.$disconnect()
}
