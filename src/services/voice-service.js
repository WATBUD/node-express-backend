import crypto from 'node:crypto'
import { parseBuffer } from 'music-metadata'

const fail = (code, statusCode, message = code) => Object.assign(new Error(message), { code, statusCode })
const MIN_DURATION_MS = 10_000
const MAX_DURATION_MS = 60_000
const ALLOWED_TYPES = new Set([
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/mpeg',
  'audio/webm',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
])

const inspectAudio = async file => {
  if (!file?.buffer?.length || !ALLOWED_TYPES.has(file.mimetype)) throw fail('INVALID_VOICE_FILE', 400)
  let metadata
  try { metadata = await parseBuffer(file.buffer, { mimeType: file.mimetype, size: file.size }) }
  catch { throw fail('INVALID_VOICE_FILE', 400) }
  const durationMs = Math.round(Number(metadata.format.duration || 0) * 1000)
  if (durationMs < MIN_DURATION_MS) throw fail('VOICE_TOO_SHORT', 400)
  if (durationMs > MAX_DURATION_MS) throw fail('VOICE_TOO_LONG', 400)
  return durationMs
}

const publicInvite = row => ({
  id: Number(row.id),
  status: row.status,
  durationMs: Number(row.duration_ms),
  createdAt: row.created_at,
  reviewedAt: row.reviewed_at,
  audioPath: `/api/voice/invites/${Number(row.id)}/audio`,
  user: {
    id: Number(row.user_id), name: row.name, image: row.image || '', gender: row.gender,
    location: row.location || '', headline: row.headline || '', bio: row.bio || '',
  },
})

export default class VoiceService {
  constructor(repository) { this.repository = repository }

  async discover(userId) {
    return (await this.repository.discover(userId)).map(row => ({
      id: Number(row.id), name: row.name, image: row.image || '', gender: row.gender,
      birthdate: row.birthdate ? row.birthdate.toISOString().slice(0, 10) : null,
      age: row.birthdate ? new Date().getUTCFullYear() - row.birthdate.getUTCFullYear()
        - (new Date().getUTCMonth() < row.birthdate.getUTCMonth()
          || (new Date().getUTCMonth() === row.birthdate.getUTCMonth()
            && new Date().getUTCDate() < row.birthdate.getUTCDate()) ? 1 : 0) : null,
      location: row.location || '', city: row.city || row.location || '',
      distanceKm: row.distance_km === null ? null : Number(row.distance_km),
      lastActiveAt: row.last_active_at,
      headline: row.headline || '', bio: row.bio || '',
      voiceDurationMs: Number(row.voice_duration_ms),
      voiceAudioPath: `/api/voice/profiles/${Number(row.id)}/audio`,
    }))
  }

  async saveProfileVoice(userId, file) {
    if (!(await this.repository.findUser(userId))) throw fail('USER_NOT_FOUND', 404)
    const durationMs = await inspectAudio(file)
    return this.repository.upsertProfileVoice({
      userId, durationMs, mimeType: file.mimetype, bytes: file.buffer,
      sha256: crypto.createHash('sha256').update(file.buffer).digest('hex'),
    })
  }

  async profileAudio(userId) {
    const targetId = Number(userId)
    if (!Number.isInteger(targetId) || targetId <= 0) throw fail('INVALID_USER_ID', 400)
    const item = await this.repository.getProfileVoice(targetId)
    if (!item) throw fail('VOICE_PROFILE_NOT_FOUND', 404)
    return item
  }

  async send(senderUserId, recipientUserId, file) {
    const recipientId = Number(recipientUserId)
    if (!Number.isInteger(recipientId) || recipientId <= 0 || recipientId === Number(senderUserId)) {
      throw fail('INVALID_VOICE_RECIPIENT', 400)
    }
    if (!(await this.repository.findUser(recipientId))) throw fail('VOICE_RECIPIENT_NOT_FOUND', 404)
    const durationMs = await inspectAudio(file)
    const result = await this.repository.create({
      senderUserId, recipientUserId: recipientId, durationMs, mimeType: file.mimetype,
      bytes: file.buffer, sha256: crypto.createHash('sha256').update(file.buffer).digest('hex'),
    })
    if (result.duplicateId) throw fail('VOICE_ALREADY_SENT', 409)
    return { id: result.id, status: 'pending', durationMs }
  }

  async list(userId, box) {
    if (!['inbox', 'sent'].includes(box)) throw fail('INVALID_VOICE_BOX', 400)
    return (await this.repository.list(userId, box)).map(publicInvite)
  }

  async audio(inviteId, userId) {
    const item = await this.repository.getAccessible(inviteId, userId)
    if (!item) throw fail('VOICE_INVITE_NOT_FOUND', 404)
    return item
  }

  async cancel(inviteId, userId) {
    if (!(await this.repository.cancel(inviteId, userId))) throw fail('VOICE_INVITE_NOT_PENDING', 409)
    return { id: Number(inviteId), status: 'cancelled' }
  }

  async review(inviteId, userId, decision) {
    if (!['approved', 'rejected'].includes(decision)) throw fail('INVALID_VOICE_DECISION', 400)
    if (!(await this.repository.review(inviteId, userId, decision))) throw fail('VOICE_INVITE_NOT_PENDING', 409)
    return { id: Number(inviteId), status: decision }
  }
}
