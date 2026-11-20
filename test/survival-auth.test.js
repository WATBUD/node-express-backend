import { expect } from 'chai'
import express from 'express'
import jwt from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import SurvivalAuthService, { SURVIVAL_AUDIENCE } from '../src/services/survival-auth-service.js'
import survivalAuthHandler from '../src/http/survival-auth-handler.js'
import survivalAuthRoutes from '../src/http/survival-auth-routes.js'

const SECRET = 'survival-test-secret'

// 記憶體版 repository：不連資料庫
class MemorySurvivalUsers {
  constructor() { this.users = [] }
  async findByAccount(account) { return this.users.find(u => u.account === account) || null }
  async findById(id) { return this.users.find(u => u.id === Number(id)) || null }
  async createUser({ account, passwordHash, nickname }) {
    if (this.users.some(u => u.account === account)) throw new Error('Duplicate entry')
    const user = { id: this.users.length + 1, account, password_hash: passwordHash, nickname, auth_token_version: 0, is_banned: 0, created_at: new Date(), last_login_at: null }
    this.users.push(user)
    return user
  }
  async touchLogin(id) { (await this.findById(id)).last_login_at = new Date() }
}

// 不依賴 supertest：啟動臨時伺服器並以 Node 內建 fetch 呼叫
const request = app => {
  const call = async (method, path, body, headers = {}) => {
    const server = app.listen(0)
    try {
      const { port } = server.address()
      const res = await fetch(`http://127.0.0.1:${port}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined,
      })
      return { status: res.status, body: await res.json().catch(() => ({})) }
    } finally {
      server.close()
    }
  }
  return {
    post: path => ({ send: body => call('POST', path, body) }),
    get: path => {
      const headers = {}
      const req = { set: (k, v) => { headers[k] = v; return req }, then: (ok, ko) => call('GET', path, null, headers).then(ok, ko) }
      return req
    },
  }
}

const buildApp = repo => {
  const app = express()
  app.use(express.json())
  app.use(expressjwt({ secret: SECRET, algorithms: ['HS256'], requestProperty: 'user' })
    .unless({ path: ['/api/survival-equation/auth/register', '/api/survival-equation/auth/login'] }))
  app.use(survivalAuthRoutes(survivalAuthHandler(new SurvivalAuthService(repo, { secret: SECRET }))))
  app.use((err, _req, res, _next) => res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: err.message } }))
  return app
}

describe('Survival Equation auth service', () => {
  it('registers, hashes the password and issues a survival-equation token', async () => {
    const repo = new MemorySurvivalUsers()
    const service = new SurvivalAuthService(repo, { secret: SECRET })
    const session = await service.register({ account: 'Survivor_01', password: 'Island2026', nickname: '漂流者' })
    expect(session.user).to.include({ account: 'survivor_01', nickname: '漂流者' })
    expect(repo.users[0].password_hash).to.not.include('Island2026')
    const claims = jwt.verify(session.accessToken, SECRET, { audience: SURVIVAL_AUDIENCE })
    expect(claims.se_user_id).to.equal(1)
  })

  it('rejects duplicate accounts case-insensitively', async () => {
    const service = new SurvivalAuthService(new MemorySurvivalUsers(), { secret: SECRET })
    await service.register({ account: 'castaway', password: 'Island2026' })
    try {
      await service.register({ account: 'CASTAWAY', password: 'Island2026' })
      expect.fail('should have thrown')
    } catch (error) {
      expect(error.code).to.equal('ACCOUNT_EXISTS')
      expect(error.status).to.equal(409)
    }
  })

  it('returns the same error for unknown accounts and wrong passwords', async () => {
    const service = new SurvivalAuthService(new MemorySurvivalUsers(), { secret: SECRET })
    await service.register({ account: 'castaway', password: 'Island2026' })
    const codes = []
    for (const body of [{ account: 'castaway', password: 'Wrong12345' }, { account: 'nobody', password: 'Island2026' }]) {
      try { await service.login(body) } catch (error) { codes.push(error.code) }
    }
    expect(codes).to.deep.equal(['INVALID_CREDENTIALS', 'INVALID_CREDENTIALS'])
  })

  it('refuses tokens issued for other services', async () => {
    const service = new SurvivalAuthService(new MemorySurvivalUsers(), { secret: SECRET })
    await service.register({ account: 'castaway', password: 'Island2026' })
    const iniClaims = jwt.decode(jwt.sign({ user_id: 1, auth_token_version: 0 }, SECRET))
    try {
      await service.me(iniClaims)
      expect.fail('should have thrown')
    } catch (error) {
      expect(error.code).to.equal('UNAUTHORIZED')
    }
  })
})

describe('Survival Equation auth HTTP API', () => {
  it('register → login → me round trip', async () => {
    const app = buildApp(new MemorySurvivalUsers())
    const reg = await request(app).post('/api/survival-equation/auth/register')
      .send({ account: 'island_kid', password: 'Coconut99', nickname: '椰子' })
    expect(reg.status).to.equal(201)
    expect(reg.body.success).to.equal(true)

    const login = await request(app).post('/api/survival-equation/auth/login')
      .send({ account: 'ISLAND_KID', password: 'Coconut99' })
    expect(login.status).to.equal(200)
    const token = login.body.data.accessToken

    const me = await request(app).get('/api/survival-equation/auth/me').set('Authorization', `Bearer ${token}`)
    expect(me.status).to.equal(200)
    expect(me.body.data).to.include({ account: 'island_kid', nickname: '椰子' })
    expect(me.body.data.lastLoginAt).to.not.equal(null)
  })

  it('validates input with the standard error shape', async () => {
    const app = buildApp(new MemorySurvivalUsers())
    const bad = await request(app).post('/api/survival-equation/auth/register').send({ account: 'a!', password: 'short' })
    expect(bad.status).to.equal(400)
    expect(bad.body.error.code).to.equal('VALIDATION_ERROR')
  })

  it('rejects requests to /me without a token', async () => {
    const app = buildApp(new MemorySurvivalUsers())
    const res = await request(app).get('/api/survival-equation/auth/me')
    expect(res.status).to.equal(401)
  })

  it('returns 409 when the account already exists', async () => {
    const app = buildApp(new MemorySurvivalUsers())
    await request(app).post('/api/survival-equation/auth/register').send({ account: 'dup_user', password: 'Island2026' })
    const again = await request(app).post('/api/survival-equation/auth/register').send({ account: 'dup_user', password: 'Island2026' })
    expect(again.status).to.equal(409)
    expect(again.body.error.code).to.equal('ACCOUNT_EXISTS')
  })
})
