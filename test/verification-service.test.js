import { expect } from 'chai'
import { requestVerification } from '../src/services/verification-service.js'

describe('verification service delivery', () => {
  const original = {
    nodeEnv: process.env.NODE_ENV,
    provider: process.env.EMAIL_PROVIDER,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_APP_PASSWORD,
  }

  afterEach(() => {
    const restore = (key, value) => {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    restore('NODE_ENV', original.nodeEnv)
    restore('EMAIL_PROVIDER', original.provider)
    restore('EMAIL_USER', original.user)
    restore('EMAIL_APP_PASSWORD', original.password)
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
})
