import { PrismaClient } from "@prisma/client";
import { iniDatabaseUrl, watchlabDatabaseUrl } from '../database/database-urls.js';

class UserRepository {
  constructor(databaseUrl, label) {
    this.label = label;
    this.prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    this.checkConnection();
  }
  async checkConnection() {
    try {
      await this.prisma.$connect();
      console.log(`${this.label} database connection successful.`);
    } catch (error) {
      console.error(`${this.label} database connection failed:`, error);
    }
  }
  async updateUserAvatar(userId, filePath) {
    try {
      return await this.prisma.users.update({
        where: { user_id: parseInt(userId, 10) },
        data: { avatar: filePath },
      });
    } catch (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }
  }
  
  async getAssignViewTable(viewTablename,limit) {
    try {
      if (!viewTablename) {
        throw new Error("viewTablename 不能是空字符串");
      }
      //console.log(customViewData);
      console.log(viewTablename);

      let customQuery = `SELECT * FROM ${viewTablename}`
      if (limit && !isNaN(limit) && limit > 0) {
        customQuery += ` LIMIT ${limit}`;
      }

      let customQueryCallbackData = await this.prisma.$queryRawUnsafe(
        customQuery
      );

      console.log(customQueryCallbackData);

      return customQueryCallbackData;
    } catch (error) {
      console.error("發生錯誤：", error.message);
    }
  }
  async findUserByAccount(account) {
    return this.prisma.users.findUnique({
      where: { user_account:account }
    });
  }

  async findUserByLogin(account) {
    const normalized = account.trim().toLowerCase();
    return this.prisma.users.findFirst({
      where: {
        OR: [
          { user_account: normalized },
          { email: normalized },
          { phone: normalized },
        ],
      },
    });
  }

  async createUser(data) {
    return this.prisma.users.create({ data });
  }

  async updateGenderIfAllowed(userId, gender, cutoff, changedAt) {
    const result = await this.prisma.users.updateMany({
      where: {
        user_id: Number(userId),
        gender: { not: gender },
        OR: [
          { gender_changed_at: null },
          { gender_changed_at: { lte: cutoff } },
        ],
      },
      data: { gender, gender_changed_at: changedAt },
    })
    if (!result.count) return null
    return this.getUserById(userId)
  }

  async updateBirthdate(userId, birthdate) {
    return this.prisma.users.update({
      where: { user_id: Number(userId) },
      data: { birthdate },
    })
  }

  async getUserById(id) {
    const userId = parseInt(id, 10);

    // Query the database using the converted numeric id
    return await this.prisma.users.findUnique({
      where: { user_id: userId },
    });
  }
  async getAllUsers() {
    return await this.prisma.users.findMany();
  }
}
const UserRepositoryInstance = new UserRepository(watchlabDatabaseUrl, 'WatchLab');
export const iniUserRepository = new UserRepository(iniDatabaseUrl, 'INI Dating');

export default UserRepositoryInstance;
