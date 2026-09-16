import jwt from 'jsonwebtoken'

export default class PushService {
  constructor(repository, fetchImpl = fetch) {
    this.repository = repository
    this.fetch = fetchImpl
    this.cachedAccessToken = null
  }

  async register(userId, input) {
    const token = String(input?.token || '').trim()
    const platform = String(input?.platform || '')
    if (!token || token.length > 512 || !['android', 'ios'].includes(platform)) throw Object.assign(new Error('INVALID_PUSH_DEVICE'), { code: 'INVALID_PUSH_DEVICE', statusCode: 400 })
    await this.repository.register(userId, token, platform)
    return { registered: true }
  }

  async remove(userId, input) {
    const token = String(input?.token || '').trim()
    if (token) await this.repository.remove(userId, token)
    return { removed: true }
  }

  credentials() {
    try { return JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON || '') }
    catch { return null }
  }

  async accessToken(credentials) {
    if (this.cachedAccessToken?.expiresAt > Date.now() + 60000) return this.cachedAccessToken.value
    const now = Math.floor(Date.now() / 1000)
    const assertion = jwt.sign({
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: credentials.token_uri || 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }, credentials.private_key, { algorithm: 'RS256' })
    const response = await this.fetch(credentials.token_uri || 'https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    })
    if (!response.ok) throw new Error(`FCM_OAUTH_${response.status}`)
    const body = await response.json()
    this.cachedAccessToken = { value: body.access_token, expiresAt: Date.now() + Number(body.expires_in || 3600) * 1000 }
    return body.access_token
  }

  async sendNewMessage({ recipientUserId, senderUserId }) {
    const credentials = this.credentials()
    const projectId = process.env.FCM_PROJECT_ID || credentials?.project_id
    if (!credentials?.client_email || !credentials?.private_key || !projectId) return { skipped: 'FCM_NOT_CONFIGURED' }
    const accessToken = await this.accessToken(credentials)
    const devices = await this.repository.tokens(recipientUserId)
    await Promise.allSettled(devices.map(async device => {
      const response = await this.fetch(`https://fcm.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/messages:send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: {
          token: device.token,
          notification: { title: 'INI Dating', body: '你有一則新訊息' },
          data: { type: 'chat', senderUserId: String(senderUserId) },
          android: { priority: 'high', notification: { channel_id: 'messages' } },
        } }),
      })
      if ([404, 410].includes(response.status)) await this.repository.removeToken(device.token)
      if (!response.ok) throw new Error(`FCM_SEND_${response.status}`)
    }))
    return { sent: devices.length }
  }
}
