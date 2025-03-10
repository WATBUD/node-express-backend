import { PrismaClient } from "@prisma/client";

class StockRepository {
  constructor() {
    if (!StockRepository.instance) {
      StockRepository.instance = this;
      this.prisma = new PrismaClient();
    }
    return StockRepository.instance;
  }

  async getStockTrackingList(inputData) {
      const startTime = new Date();
      const whereClause = {
        user_id: String(inputData.user_id),
      };

      if (inputData.contains_is_blocked!=undefined) {
        const _containsBlocked = inputData.contains_is_blocked === "true" ;

        if(!_containsBlocked)
        whereClause.is_blocked = false;
      }
      const result = await this.prisma.user_stock.findMany({
        where: whereClause,
      });
      const endTime = new Date();
      const executionTime = endTime - startTime;
      console.log("getStockTrackingList query execution time:", executionTime, "milliseconds");
      return result;
  }     

  async addStockToTrackinglist(inputData) {
    const createdUserStock = await this.prisma.user_stock.create({
      data: {   
        user_id: String(inputData.user_id),
        stock_id: inputData.stock_id,
        note: inputData.note || "", // Default note to an empty string if not provided
        is_blocked: inputData.is_blocked, // Use the isBlocked parameter
      },
    });
    return createdUserStock;
  }

  async deleteStockTrackinglist(inputData) {
    const deletedUserStock = await this.prisma.user_stock.delete({
      where: {
        stock_id_user_id: {
          user_id: String(inputData.user_id),
          stock_id: inputData.stock_id,
        },
      },
    });
    return deletedUserStock;
  }

  async updateSpecifiedStockTrackingData(inputData) {
    try {
      const updatedUserStock = await this.prisma.user_stock.update({
        where: {
          stock_id_user_id: {
            user_id: String(inputData.user_id),
            stock_id: inputData.stock_id,
          },
        },
        data: {
          note: inputData.note,
          is_blocked: inputData.is_blocked,
          updated_at: new Date(),
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
