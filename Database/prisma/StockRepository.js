import { PrismaClient } from "@prisma/client";

class StockRepository {
  constructor() {
    if (!StockRepository.instance) {
      StockRepository.instance = this;
      this.prisma = new PrismaClient();
    }
    return StockRepository.instance;
  }


  async getStockTrackinglist(userId) {
    try {
      const _userId = BigInt(userId).toString();
      return await this.prisma.user_stock.findMany({
        where: { user_id: _userId }
      });
    } catch (error) {
      console.error("Error getStockTrackinglist:", error);
      throw error; // 重新拋出錯誤以便上層處理
    }
  }
  
  
  async createStockTrackinglist(userID, stockID) {
    try {
      const createdUserStock = await this.prisma.user_stock.create({
        data: {
          user_id: userID,
          stock_id: stockID,
        },
      });
      return createdUserStock;
    } catch (error) {
      // 在這裡處理錯誤
      console.error("Error creating stock tracking list:", error);
      if (error.message.includes('Unique constraint')) {
        throw new Error('使用者已收藏此股票');
      }
      
      throw error; // 重新拋出錯誤以便上層處理
    }
  }
  

}
const StockRepositoryInstance = new StockRepository();

export default StockRepositoryInstance;
