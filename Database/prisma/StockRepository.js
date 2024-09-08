import { PrismaClient } from "@prisma/client";

class StockRepository {
  constructor() {
    if (!StockRepository.instance) {
      StockRepository.instance = this;
      this.prisma = new PrismaClient();
    }
    return StockRepository.instance;
  }

  async getStockTrackinglist(userId, contains_is_blocked='true') {
    try {
      const startTime = new Date(); // 记录查询开始时间
  
      const _userId = BigInt(userId).toString();
      const isBlockedBoolean = contains_is_blocked === 'true';
  
      const whereClause = {
        user_id: _userId,
      };
      
      if (isBlockedBoolean==false) {
        whereClause.is_blocked = false;
      }
      
      const result = await this.prisma.user_stock.findMany({
        where: whereClause,
      });
  
      const endTime = new Date(); // 记录查询结束时间
      const executionTime = endTime - startTime; // 计算查询执行时间，单位为毫秒
  
      console.log("DB query execution time:", executionTime, "milliseconds");
  
      return result;
    } catch (error) {
      console.error("Error getStockTrackinglist:", error);
      throw error; // 重新抛出错误以便上层处理
    }
  }
  

  async addStockToTrackinglist(userID, stockID, note) {
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
      if (error.message.includes("stock_id_check")) {
        throw new Error("股票ID不符合格式");
      }
      if (error.message.includes("Unique constraint")) {
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

  async updateSpecifiedStockNote(userID, stockID,note) {
    try {
      const updatedUserStock = await this.prisma.user_stock.update({
        where: {
          stock_id_user_id: {
            stock_id: stockID,
            user_id: userID,
          },
        },
        data: {
          note: note, // 更新备注字段
        },
      });
      return updatedUserStock;
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
