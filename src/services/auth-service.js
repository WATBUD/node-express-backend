import { generateToken } from '../utilities/jwt-helper.js'
import { hashPassword, verifyPassword } from '../utilities/password-helper.js'
import { consumeVerification, requestVerification } from './verification-service.js'

const publicUser = user => ({ id: user.user_id, account: user.user_account, username: user.username, email: user.email, phone: user.phone, createdAt: user.created_at })
const authError = (message, statusCode, code) => Object.assign(new Error(message), { statusCode, code })

export default class AuthService {
  constructor(userRepository) { this.users = userRepository }

  async requestCode({ channel, destination }) {
    const existing = await this.users.findUserByLogin(destination)
    if (existing) throw authError('這個手機或 Email 已經註冊', 409, 'ACCOUNT_EXISTS')
    return requestVerification(channel, destination)
  }

  async register(input) {
    const destination = input.channel === 'phone' ? input.phone : input.email
    if (!destination || input.account.toLowerCase() !== destination.toLowerCase()) {
      throw authError('帳號與驗證聯絡方式不一致', 400, 'ACCOUNT_MISMATCH')
    }
    if (!consumeVerification(input.channel, destination, input.verificationCode)) {
      throw authError('驗證碼錯誤或已經過期', 400, 'INVALID_VERIFICATION_CODE')
    }
    if (await this.users.findUserByLogin(input.account)) {
      throw authError('這個帳號已經註冊', 409, 'ACCOUNT_EXISTS')
    }
    const user = await this.users.createUser({
      user_account: input.account.toLowerCase(), username: input.account.split('@')[0],
      email: input.email || null, phone: input.phone || null,
      birthdate: new Date(input.birthdate), password_hash: await hashPassword(input.password),
    })
    return this.session(user)
  }

  async login({ account, password }) {
    const user = await this.users.findUserByLogin(account)
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw authError('帳號或密碼不正確', 401, 'INVALID_CREDENTIALS')
    }
    if (user.is_banned) throw authError('帳號已停用', 403, 'ACCOUNT_DISABLED')
    return this.session(user)
  }

  async me(userId) {
    const user = await this.users.getUserById(userId)
    if (!user) throw authError('找不到使用者', 404, 'USER_NOT_FOUND')
    return publicUser(user)
  }

  session(user) { return { user: publicUser(user), accessToken: generateToken(user, '7d') } }
}
