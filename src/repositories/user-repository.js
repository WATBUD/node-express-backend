import { PrismaClient } from "@prisma/client";

class UserRepository {
  constructor() {
    if (!UserRepository.instance) {
      UserRepository.instance = this;
      this.prisma = new PrismaClient();
      this.checkConnection(); // Check connection when instance is created
    }
    return UserRepository.instance;
  }
  async checkConnection() {
    try {
      await this.prisma.$connect();
      console.log('Database connection successful.');
    } catch (error) {
      console.error('Database connection failed:', error);
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
      console.error("发生错误：", error.message);
    }
  }
  async findUserByAccount(account) {
    return this.prisma.users.findUnique({
      where: { user_account:account }
    });
  }

  async createUser(data) {
    return this.prisma.users.create({ data });
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
const UserRepositoryInstance = new UserRepository();

export default UserRepositoryInstance;
