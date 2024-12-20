import { PrismaClient } from "@prisma/client";

class StockRepository {
  constructor() {
    if (!StockRepository.instance) {
      StockRepository.instance = this;
      this.prisma = new PrismaClient();
    }
    return StockRepository.instance;
  }

  async getStockTrackingList(userId, contains_is_blocked='true') {
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
  
      const endTime = new Date();
      const executionTime = endTime - startTime; 
  
      console.log("DB query execution time:", executionTime, "milliseconds");
  
      return result;
    } catch (error) {
      console.error("Error getStockTrackingList:", error);
      throw error; 
    }
  }
  

  async addStockToTrackinglist(userID, stockID, note="", isBlocked = false) {
    try {
      // Create a new user stock with the given data, including is_blocked
      const createdUserStock = await this.prisma.user_stock.create({
        data: {
          user_id: userID,
          stock_id: stockID,
          note: note || '',  // Default note to an empty string if not provided
          is_blocked: isBlocked, // Use the isBlocked parameter
        },
      });
      return createdUserStock;
    } catch (error) {
      // Handle errors
      if (error.message.includes("stock_id_check")) {
        throw new Error("股票ID不符合格式");
      }
      if (error.message.includes("Unique constraint")) {
        console.error("Error creating stock tracking list:", "使用者已收藏此股票");
        throw new Error("使用者已收藏此股票");
      }
  
      throw error; // Rethrow the error for upper layers to handle
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
      if (error.code === "P2025") {
        // P2025 是 Prisma 中唯一約束違規的錯誤碼
        console.error(
          "Error deleting stock tracking list:",
          "使用者未收藏此股票"
        );
        throw new Error("使用者未收藏此股票");
      }

      throw error; 
    }
  }

  async updateSpecifiedStockTrackingData(updateStockData) {
    try {
      const updatedUserStock = await this.prisma.user_stock.update({
        where: {
          stock_id_user_id: {
            stock_id: updateStockData.stock_id,
            user_id: String(updateStockData.user_id)
          },
        },
        data: {
          note: updateStockData.note, 
          is_blocked: updateStockData.is_blocked,
        },
      });
      return updatedUserStock;
    } catch (error) {
      if (error.code === "P2025") {
        // P2025 是 Prisma 中唯一約束違規的錯誤碼
        console.error(
          "Error deleting stock tracking list:",
          "使用者未收藏此股票"
        );
        throw new Error("使用者未收藏此股票");
      }

      throw error; 
    }
  }
}

export default new StockRepository();
