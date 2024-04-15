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


  async disconnect() {
    await this.prisma.$disconnect();
  }
}
const PrismaServiceInstance = new PrismaService();

export default PrismaServiceInstance;
