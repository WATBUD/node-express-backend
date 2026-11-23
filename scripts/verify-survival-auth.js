// Real database verification. Only randomly named accounts created by this run are removed.
import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import express from 'express'
import cors from 'cors'
import { expressjwt } from 'express-jwt'
import { buildCorsOptions } from '../src/config/cors-config.js'
import { SurvivalUserRepository } from '../src/repositories/survival-user-repository.js'
import SurvivalAuthService from '../src/services/survival-auth-service.js'
import handler from '../src/http/survival-auth-handler.js'
import routes from '../src/http/survival-auth-routes.js'

assert(process.env.JWT_SECRET, 'JWT_SECRET is required')
const repo = new SurvivalUserRepository()
const account = `se_verify_${randomBytes(6).toString('hex')}`
const gameAccount = `${account}_game`
const password = `Verify9${randomBytes(16).toString('hex')}`
const origin = 'https://survival-equation-web.vercel.app'
const app = express()
app.use(cors(buildCorsOptions()))
app.use(express.json({ limit: '32kb' }))
app.use(expressjwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'], requestProperty: 'user' })
  .unless({ path: ['/api/survival-equation/auth/register', '/api/survival-equation/auth/login'] }))
app.use(routes(handler(new SurvivalAuthService(repo))))
app.use((error, _req, res, _next) => res.status(error.status || 500).json({ success: false, error: { code: 'UNAUTHORIZED' } }))
const server = app.listen(0, '127.0.0.1')
await new Promise(resolve => server.once('listening', resolve))
const base = process.env.SURVIVAL_AUTH_VERIFY_URL?.replace(/\/$/, '') || `http://127.0.0.1:${server.address().port}`
const call = async (path, body, token) => {
  const response = await fetch(`${base}/api/survival-equation/auth/${path}`, {
    method: body ? 'POST' : 'GET', headers: { Origin: origin, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000),
  })
  assert.equal(response.headers.get('access-control-allow-origin'), origin)
  return { status: response.status, body: await response.json() }
}
const ownedAccounts = []
try {
  for (const name of [account, gameAccount]) {
    assert.equal(await repo.findByAccount(name), null)
    ownedAccounts.push(name)
  }
  const registered = await call('register', { account, password, nickname: '部署驗證' })
  assert.equal(registered.status, 201)
  assert.equal(registered.body.success, true)
  assert.equal(registered.body.data.user.account, account)
  assert(registered.body.data.accessToken)
  assert.equal(Number((await repo.findByAccount(account))?.id), registered.body.data.user.id, 'API must use the expected database')
  const duplicate = await call('register', { account, password })
  assert.equal(duplicate.status, 409)
  assert.equal(duplicate.body.error.code, 'ACCOUNT_EXISTS')
  const wrong = await call('login', { account, password: 'IncorrectPassword9' })
  assert.equal(wrong.status, 401)
  assert.equal(wrong.body.error.code, 'INVALID_CREDENTIALS')
  const login = await call('login', { account: account.toUpperCase(), password })
  assert.equal(login.status, 200)
  const me = await call('me', null, login.body.data.accessToken)
  assert.equal(me.status, 200)
  assert.equal(me.body.data.account, account)
  const missing = await call('me')
  assert.equal(missing.status, 401)
  console.log('REAL_DB_AUTH PASS: registration, duplicate, wrong password, login, token, /me and CORS')
  const godot = process.env.SURVIVAL_GODOT
  const gamePath = process.env.SURVIVAL_GAME_PATH
  if (godot && gamePath) {
    const child = spawn(godot, ['--headless', '--path', gamePath, '--script', 'tests/auth_flow.gd'], {
      env: { ...process.env, SURVIVAL_API_URL: base, SURVIVAL_TEST_ACCOUNT: gameAccount }, stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output += chunk.toString(); process.stdout.write(chunk) })
    const timer = setTimeout(() => child.kill(), 90000)
    try {
      const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve) })
      assert.equal(code, 0, 'Godot auth flow must pass')
      assert(!/SCRIPT ERROR:|Parse Error|Failed to load script/.test(output), 'Godot must not report script errors')
    } finally { clearTimeout(timer) }
  }
} finally {
  await new Promise(resolve => server.close(resolve))
  try {
    for (const name of ownedAccounts) await repo.prisma.$executeRaw`DELETE FROM se_users WHERE account = ${name}`
    console.log('Temporary verification accounts removed.')
  } finally { await repo.prisma.$disconnect() }
}
