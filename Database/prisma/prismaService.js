import { PrismaClient } from "@prisma/client";

class PrismaService {
  constructor() {
    if (!PrismaService.instance) {
      PrismaService.instance = this;
      // 在这里初始化 PrismaClient
      this.prisma = new PrismaClient();
    }
    return PrismaService.instance;
  }

  async getAllUsers() {
    const allUsers = await this.prisma.user_detail.findMany();
    console.log(allUsers);
  }

  async getAssignViewTable(viewTablename) {
    try {
      if (!viewTablename) {
        throw new Error("viewTablename 不能是空字符串");
      }
      //console.log(customViewData);

      console.log(viewTablename);
      const customViewData = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM ${viewTablename}`
      );
      //const customViewData = await this.prisma.$queryRaw`SELECT * FROM V_TagGroupDetail`;
      return customViewData;
    } catch (error) {
      console.error("发生错误：", error.message);
      // 在这里可以处理错误，比如记录日志、返回错误信息等
    }
  }

  async getUserById(id) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
  async disconnect() {
    await this.prisma.$disconnect();
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
const prismaServiceInstance = new PrismaService();

export default prismaServiceInstance;
