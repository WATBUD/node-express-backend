import { PrismaClient } from "@prisma/client";

class StockRepository {
  constructor() {
    if (!StockRepository.instance) {
      StockRepository.instance = this;
      this.prisma = new PrismaClient();
    }
    return StockRepository.instance;
  }

  
  async getStockTrackinglist(id) {
    const userId = parseInt(id, 10);
      return await this.prisma.user_stock.findUnique({
      where: { stock_userid: userId },
      select: { favorite_stocks: true } // 選擇要返回的欄位
    });
  }

}
const StockRepositoryInstance = new StockRepository();

export default StockRepositoryInstance;
