import jwt from 'jsonwebtoken'
import { hashPassword, verifyPassword } from '../utilities/password-helper.js'

// JWT audience：區隔 Survival Equation 與其他服務（INI Dating／WatchLab）的權杖
export const SURVIVAL_AUDIENCE = 'survival-equation'
const TOKEN_TTL = '7d'

export class SurvivalAuthError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

const normalizeAccount = account => String(account || '').trim().toLowerCase()

const publicUser = user => ({
  id: Number(user.id),
  account: user.account,
  nickname: user.nickname,
  createdAt: user.created_at,
  lastLoginAt: user.last_login_at ?? null,
})

export default class SurvivalAuthService {
  constructor(repository, { secret = process.env.JWT_SECRET } = {}) {
    this.repository = repository
    this.secret = secret
  }

  issueToken(user) {
    if (!this.secret) throw new Error('JWT_SECRET is not defined')
    return jwt.sign(
      { se_user_id: Number(user.id), account: user.account, token_version: Number(user.auth_token_version || 0) },
      this.secret,
      { expiresIn: TOKEN_TTL, audience: SURVIVAL_AUDIENCE, subject: String(user.id) },
    )
  }

  async register({ account, password, nickname }) {
    const normalized = normalizeAccount(account)
    if (await this.repository.findByAccount(normalized)) {
      throw new SurvivalAuthError(409, 'ACCOUNT_EXISTS', 'This account name is already taken.')
    }
    const passwordHash = await hashPassword(password)
    let user
    try {
      user = await this.repository.createUser({
        account: normalized,
        passwordHash,
        nickname: (nickname || '').trim() || normalized,
      })
    } catch (error) {
      // 同時註冊同名帳號時由 UNIQUE 索引擋下
      if (String(error?.message || '').includes('Duplicate')) {
        throw new SurvivalAuthError(409, 'ACCOUNT_EXISTS', 'This account name is already taken.')
      }
      throw error
    }
    return { accessToken: this.issueToken(user), user: publicUser(user) }
  }

  async login({ account, password }) {
    const user = await this.repository.findByAccount(normalizeAccount(account))
    // 帳號不存在與密碼錯誤回傳相同錯誤，避免帳號列舉
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new SurvivalAuthError(401, 'INVALID_CREDENTIALS', 'The account or password is incorrect.')
    }
    if (user.is_banned) throw new SurvivalAuthError(403, 'ACCOUNT_BANNED', 'This account has been suspended.')
    await this.repository.touchLogin(user.id)
    return { accessToken: this.issueToken(user), user: publicUser(user) }
  }

  /** 由已驗證的 JWT 內容取得玩家；非 Survival Equation 權杖一律拒絕 */
  async me(claims) {
    const aud = Array.isArray(claims?.aud) ? claims.aud : [claims?.aud]
    if (!claims || !aud.includes(SURVIVAL_AUDIENCE) || !claims.se_user_id) {
      throw new SurvivalAuthError(401, 'UNAUTHORIZED', 'UNAUTHORIZED')
    }
    const user = await this.repository.findById(claims.se_user_id)
    if (!user || Number(user.auth_token_version || 0) !== Number(claims.token_version || 0)) {
      throw new SurvivalAuthError(401, 'UNAUTHORIZED', 'UNAUTHORIZED')
    }
    if (user.is_banned) throw new SurvivalAuthError(403, 'ACCOUNT_BANNED', 'This account has been suspended.')
    return publicUser(user)
  }
}
