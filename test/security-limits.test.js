import { expect } from 'chai'
import express from 'express'
import request from 'supertest'
import authRoutes from '../src/http/auth-routes.js'

describe('Auth abuse protection', () => {
  it('limits repeated verification emails for the same IP and destination', async () => {
    const app = express()
    app.use(express.json())
    const ok = (_req, res) => res.json({ success: true, data: {} })
    app.use(
      authRoutes({
        requestVerification: ok,
        register: ok,
        login: ok,
        me: ok,
        updateGender: ok,
        updateBirthdate: ok,
      }),
    )

    for (let index = 0; index < 5; index += 1) {
      const response = await request(app)
        .post('/api/auth/verification/request')
        .send({ channel: 'email', destination: 'limit-test@example.com' })
      expect(response.status).to.equal(200)
    }

    const blocked = await request(app)
      .post('/api/auth/verification/request')
      .send({ channel: 'email', destination: 'limit-test@example.com' })

    expect(blocked.status).to.equal(429)
    expect(blocked.body.error.code).to.equal(
      'VERIFICATION_DESTINATION_RATE_LIMITED',
    )
    expect(blocked.body.error.message).to.match(/Too many verification emails/)
    expect(blocked.headers).to.have.property('ratelimit')
  })
})
