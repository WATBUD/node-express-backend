import { PrismaClient } from "@prisma/client";

class SharedRepository {
  constructor() {
    if (!SharedRepository.instance) {
      SharedRepository.instance = this;
      this.prisma = new PrismaClient();
    }
    return SharedRepository.instance;
  }
  async createRequestLog(requestLog) {
    return this.prisma.request_logs.create({
      data: requestLog,
    });
  }
  async getAssignViewTable(viewTablename,limit) {
    try {
      if (!viewTablename) {
        throw new Error("The table name cannot be an empty string");
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
      console.error("error：", error.message);
    }
  }
}
const SharedRepositoryInstance = new SharedRepository();

export default SharedRepositoryInstance;
