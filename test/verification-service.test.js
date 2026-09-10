import { expect } from 'chai'
import { requestVerification } from '../src/services/verification-service.js'
import { sendVerificationEmail } from '../src/services/email-service.js'

describe('verification service delivery', () => {
  const original = {
    nodeEnv: process.env.NODE_ENV,
    provider: process.env.EMAIL_PROVIDER,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_APP_PASSWORD,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    from: process.env.EMAIL_FROM,
  }
  const originalFetch = global.fetch

  afterEach(() => {
    const restore = (key, value) => {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    restore('NODE_ENV', original.nodeEnv)
    restore('EMAIL_PROVIDER', original.provider)
    restore('EMAIL_USER', original.user)
    restore('EMAIL_APP_PASSWORD', original.password)
    restore('GMAIL_CLIENT_ID', original.clientId)
    restore('GMAIL_CLIENT_SECRET', original.clientSecret)
    restore('GMAIL_REFRESH_TOKEN', original.refreshToken)
    restore('EMAIL_FROM', original.from)
    global.fetch = originalFetch
  })

  it('fails explicitly when production email delivery is not configured', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.EMAIL_PROVIDER
    delete process.env.EMAIL_USER
    delete process.env.EMAIL_APP_PASSWORD

    try {
      await requestVerification('email', 'production-missing-config@example.com')
      expect.fail('Expected delivery failure')
    } catch (error) {
      expect(error.code).to.equal('VERIFICATION_DELIVERY_FAILED')
      expect(error.statusCode).to.equal(502)
    }
  })

  it('sends verification mail through the Gmail HTTPS API', async () => {
    process.env.EMAIL_PROVIDER = 'gmail_api'
    process.env.EMAIL_USER = 'sender@example.com'
    process.env.EMAIL_FROM = 'INI Dating <sender@example.com>'
    process.env.GMAIL_CLIENT_ID = 'client-id'
    process.env.GMAIL_CLIENT_SECRET = 'client-secret'
    process.env.GMAIL_REFRESH_TOKEN = 'refresh-token'
    const calls = []
    global.fetch = async (url, options) => {
      calls.push({ url, options })
      if (url.includes('oauth2.googleapis.com')) {
        return new Response(JSON.stringify({ access_token: 'access-token' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      }
      return new Response(JSON.stringify({ id: 'message-id' }), { status: 200 })
    }

    const sent = await sendVerificationEmail({
      destination: 'recipient@example.com',
      code: '123456',
    })

    expect(sent).to.equal(true)
    expect(calls).to.have.length(2)
    expect(calls[0].url).to.equal('https://oauth2.googleapis.com/token')
    expect(String(calls[0].options.body)).to.include('grant_type=refresh_token')
    expect(calls[1].url).to.include('/gmail/v1/users/me/messages/send')
    expect(calls[1].options.headers.authorization).to.equal('Bearer access-token')
    const payload = JSON.parse(calls[1].options.body)
    const raw = Buffer.from(payload.raw, 'base64url').toString('utf8')
    expect(raw).to.include('To: recipient@example.com')
    expect(raw).to.include('Content-Type: text/html; charset=UTF-8')
  })
})
