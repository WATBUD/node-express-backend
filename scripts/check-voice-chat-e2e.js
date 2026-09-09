import fs from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'
import { generateToken } from '../src/utilities/jwt-helper.js'

const audioPath = process.argv[2]
if (!audioPath) throw new Error('Usage: node scripts/check-voice-chat-e2e.js <10-to-60-second-audio-file>')

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })
let inviteId = null
let low = null
let high = null
try {
  const pairs = await db.$queryRawUnsafe(`
    SELECT a.user_id AS sender, b.user_id AS recipient
    FROM users a JOIN users b ON a.user_id < b.user_id
    LEFT JOIN connections c ON c.user_low_id = a.user_id AND c.user_high_id = b.user_id
    LEFT JOIN voice_invites v ON v.sender_user_id = a.user_id AND v.recipient_user_id = b.user_id AND v.status = 'pending'
    WHERE c.id IS NULL AND v.id IS NULL
    LIMIT 1`)
  if (!pairs.length) throw new Error('No isolated user pair is available for the smoke test.')
  const { sender, recipient } = pairs[0]
  low = Math.min(Number(sender), Number(recipient))
  high = Math.max(Number(sender), Number(recipient))
  const token = userId => generateToken({ user_id: Number(userId), username: 'e2e' }, '5m')
  const audio = await fs.readFile(audioPath)
  const form = new FormData()
  form.append('recipientUserId', String(recipient))
  form.append('audio', new Blob([audio], { type: 'audio/mp4' }), 'smoke.m4a')

  const created = await fetch('http://localhost:3000/api/voice/invites', { method: 'POST', headers: { Authorization: `Bearer ${token(sender)}` }, body: form })
  const createdBody = await created.json()
  if (!created.ok) throw new Error(`Invite failed: ${created.status} ${JSON.stringify(createdBody)}`)
  inviteId = createdBody.data.id
  const reviewed = await fetch(`http://localhost:3000/api/voice/invites/${inviteId}/review`, { method: 'POST', headers: { Authorization: `Bearer ${token(recipient)}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ decision: 'approved' }) })
  const sent = await fetch(`http://localhost:3000/api/chat/users/${recipient}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${token(sender)}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'voice flow e2e' }) })
  const messages = await fetch(`http://localhost:3000/api/chat/users/${sender}/messages`, { headers: { Authorization: `Bearer ${token(recipient)}` } })
  const messageBody = await messages.json()
  const threads = await fetch('http://localhost:3000/api/chat/threads', { headers: { Authorization: `Bearer ${token(sender)}` } })
  const threadBody = await threads.json()
  const result = {
    inviteStatus: created.status,
    reviewStatus: reviewed.status,
    messageStatus: sent.status,
    recipientReadStatus: messages.status,
    textMatched: messageBody.data?.some(item => item.text === 'voice flow e2e') === true,
    threadVisible: threadBody.data?.some(item => item.user.id === Number(recipient)) === true,
  }
  if (Object.values(result).some(value => value === false) || reviewed.status !== 200 || sent.status !== 201 || messages.status !== 200) {
    throw new Error(`Smoke test assertions failed: ${JSON.stringify(result)}`)
  }
  console.log(result)
} finally {
  if (low !== null) await db.$executeRawUnsafe('DELETE FROM connections WHERE user_low_id = ? AND user_high_id = ?', low, high)
  if (inviteId !== null) await db.$executeRawUnsafe('DELETE FROM voice_invites WHERE id = ?', inviteId)
  await db.$disconnect()
}
