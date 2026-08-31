import crypto from 'crypto'
import { isEmailConfigured, sendVerificationEmail } from './email-service.js'

const CODE_TTL_MS = 10 * 60 * 1000
const RESEND_MS = 60 * 1000
const attempts = new Map()

const keyOf = (channel, destination) => `${channel}:${destination.toLowerCase()}`
const digest = value => crypto.createHash('sha256').update(value).digest('hex')

export const requestVerification = async (channel, destination) => {
  const key = keyOf(channel, destination)
  const previous = attempts.get(key)
  if (previous && Date.now() - previous.sentAt < RESEND_MS) {
    const retryAfter = Math.ceil((RESEND_MS - (Date.now() - previous.sentAt)) / 1000)
    const error = new Error(`請在 ${retryAfter} 秒後再試`)
    error.statusCode = 429
    error.code = 'VERIFICATION_RATE_LIMITED'
    throw error
  }
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
  attempts.set(key, { hash: digest(code), sentAt: Date.now(), expiresAt: Date.now() + CODE_TTL_MS, failures: 0 })

  try {
    if (channel === 'email' && isEmailConfigured()) {
      await sendVerificationEmail({ destination, code })
      return {}
    }
  } catch (error) {
    attempts.delete(key)
    const deliveryError = new Error('驗證信傳送失敗，請稍後再試')
    deliveryError.statusCode = 502
    deliveryError.code = 'VERIFICATION_DELIVERY_FAILED'
    deliveryError.cause = error
    throw deliveryError
  }

  // 未設定寄信服務時，僅在非正式環境回傳測試碼。
  return process.env.NODE_ENV === 'production' ? {} : { developmentCode: code }
}

export const consumeVerification = (channel, destination, code) => {
  const key = keyOf(channel, destination)
  const record = attempts.get(key)
  if (!record || record.expiresAt < Date.now()) {
    attempts.delete(key)
    return false
  }
  if (record.failures >= 5 || digest(code) !== record.hash) {
    record.failures += 1
    return false
  }
  attempts.delete(key)
  return true
}
