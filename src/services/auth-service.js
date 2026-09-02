import { generateToken } from '../utilities/jwt-helper.js'
import { hashPassword, verifyPassword } from '../utilities/password-helper.js'
import { consumeVerification, requestVerification } from './verification-service.js'

const GENDER_CHANGE_DAYS = 30
const publicUser = user => ({ id: user.user_id, account: user.user_account, username: user.username, email: user.email, phone: user.phone, birthdate: user.birthdate ? user.birthdate.toISOString().slice(0, 10) : null, gender: user.gender, gender_changed_at: user.gender_changed_at, createdAt: user.created_at })
const authError = (message, statusCode, code) => Object.assign(new Error(message), { statusCode, code })
const parseBirthdate = value => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match.map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return date
}
const ageAt = (birthdate, today = new Date()) => {
  let age = today.getUTCFullYear() - birthdate.getUTCFullYear()
  if (today.getUTCMonth() < birthdate.getUTCMonth() || (today.getUTCMonth() === birthdate.getUTCMonth() && today.getUTCDate() < birthdate.getUTCDate())) age -= 1
  return age
}

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
      birthdate: new Date(input.birthdate), gender: input.gender,
      password_hash: await hashPassword(input.password),
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

  async updateGender(userId, { gender }) {
    const user = await this.users.getUserById(userId)
    if (!user) throw authError('User not found.', 404, 'USER_NOT_FOUND')
    if (user.gender === gender) return publicUser(user)

    const now = new Date()
    const cutoff = new Date(now.getTime() - GENDER_CHANGE_DAYS * 24 * 60 * 60 * 1000)
    const updated = await this.users.updateGenderIfAllowed(userId, gender, cutoff, now)
    if (!updated) {
      throw authError('Gender can only be changed once every 30 days.', 429, 'GENDER_CHANGE_COOLDOWN')
    }
    return publicUser(updated)
  }

  async updateBirthdate(userId, { birthdate }) {
    const user = await this.users.getUserById(userId)
    if (!user) throw authError('User not found.', 404, 'USER_NOT_FOUND')
    const parsed = parseBirthdate(birthdate)
    if (!parsed) throw authError('Invalid birthdate.', 400, 'INVALID_BIRTHDATE')
    const age = ageAt(parsed)
    if (age < 18 || age > 120) throw authError('Birthdate must represent an age from 18 to 120.', 400, 'BIRTHDATE_AGE_RESTRICTED')
    return publicUser(await this.users.updateBirthdate(userId, parsed))
  }

  session(user) { return { user: publicUser(user), accessToken: generateToken(user, '7d') } }
}
