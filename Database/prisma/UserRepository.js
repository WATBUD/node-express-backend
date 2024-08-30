import { PrismaClient } from "@prisma/client";

class UserRepository {
  constructor() {
    if (!UserRepository.instance) {
      UserRepository.instance = this;
      this.prisma = new PrismaClient();
    }
    return UserRepository.instance;
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

  async checkUserlogin(user_data) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { 
        account: user_data.account,
        password: user_data.password,
      }});
      return user;
    } catch (error) {
      console.error("发生错误：", error.message);
    }
  }


  async getUserById(id) {
    const userId = parseInt(id, 10);

    // Query the database using the converted numeric id
    return await this.prisma.users.findUnique({
      where: { user_id: userId },
    });
  }
  async getAllUsers() {
    const allUsers = await this.prisma.user_detail.findMany();
    console.log(allUsers);
  }

  async _findMany() {
    const allUsers = await this.prisma.user.findMany();
    console.log(allUsers);
  }

  async prismacreate() {
    await this.prisma.user.create({
      data: {
        name: "Alice",
        email: "alice@prisma.io",
        posts: {
          create: { title: "Hello World" },
        },
        profile: {
          create: { bio: "I like turtles" },
        },
      },
    });

    const allUsers = await this.prisma.user.findMany({
      include: {
        posts: true,
        profile: true,
      },
    });
    console.dir(allUsers, { depth: null });
  }
}
const UserRepositoryInstance = new UserRepository();

export default UserRepositoryInstance;
