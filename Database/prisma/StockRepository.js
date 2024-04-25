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
        where: { user_id: _userId },
      });
    } catch (error) {
      console.error("Error getStockTrackinglist:", error);
      throw error; // 重新拋出錯誤以便上層處理
    }
  }

  async createStockTrackinglist(userID, stockID,note) {
    try {
      const createdUserStock = await this.prisma.user_stock.create({
        data: {
          user_id: userID,
          stock_id: stockID,
          note: note,
        },
      });
      return createdUserStock;
    } catch (error) {
      // 在這裡處理錯誤
      if (error.message.includes("Unique constraint")) {
        //console.error("Error creating stock tracking list:", error);
        console.error(
          "Error creating stock tracking list:",
          "使用者已收藏此股票"
        );
        throw new Error("使用者已收藏此股票");
      }

      throw error; // 重新拋出錯誤以便上層處理
    }
  }

  async deleteStockTrackinglist(userID, stockID) {
    try {
      const deletedUserStock = await this.prisma.user_stock.delete({
        where: {
          stock_id_user_id: {
            stock_id: stockID,
            user_id: userID,
          },
        },
      });
      return deletedUserStock;
    } catch (error) {
      // 在這裡處理錯誤
      if (error.code === "P2025") {
        // P2025 是 Prisma 中唯一約束違規的錯誤碼
        console.error(
          "Error deleting stock tracking list:",
          "使用者未收藏此股票"
        );
        throw new Error("使用者未收藏此股票");
      }

      throw error; // 重新拋出錯誤以便上層處理
    }
  }
}
const StockRepositoryInstance = new StockRepository();

export default StockRepositoryInstance;
