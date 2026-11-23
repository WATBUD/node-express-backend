import { PrismaClient } from '@prisma/client'
import { survivalEquationDatabaseUrl } from '../database/database-urls.js'

// Survival Equation 玩家帳號（獨立 Database：survival_equation）。
// 使用參數化查詢（Prisma tagged template），不與其他服務共用連線。
export class SurvivalUserRepository {
  constructor(databaseUrl = survivalEquationDatabaseUrl) {
    this.prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })
  }

  async findByAccount(account) {
    const rows = await this.prisma.$queryRaw`
      SELECT id, account, password_hash, nickname, auth_token_version, is_banned, last_login_at, created_at
      FROM se_users WHERE account = ${account} LIMIT 1`
    return rows[0] || null
  }

  async findById(id) {
    const rows = await this.prisma.$queryRaw`
      SELECT id, account, password_hash, nickname, auth_token_version, is_banned, last_login_at, created_at
      FROM se_users WHERE id = ${BigInt(id)} LIMIT 1`
    return rows[0] || null
  }

  async createUser({ account, passwordHash, nickname }) {
    await this.prisma.$executeRaw`
      INSERT INTO se_users (account, password_hash, nickname) VALUES (${account}, ${passwordHash}, ${nickname})`
    return this.findByAccount(account)
  }

  async touchLogin(id) {
    await this.prisma.$executeRaw`UPDATE se_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ${BigInt(id)}`
  }
}

// 延遲建立：測試或未使用此服務時不會連線
let instance = null
export const survivalUserRepository = () => (instance ??= new SurvivalUserRepository())
