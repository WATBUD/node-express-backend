import { PrismaClient, Prisma } from "@prisma/client";

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
        user_id: Number(inputData.user_id),
      };

      if (inputData.contains_is_blocked!=undefined) {
        const _containsBlocked = inputData.contains_is_blocked === "true" ;

        if(!_containsBlocked)
        whereClause.is_blocked = false;
      }
      const result = await this.prisma.user_stock.findMany({
        where: whereClause,
      });

      // 併入名稱：用 stock 主檔（主鍵查詢，1400 列小表）補上 name
      if (result.length > 0) {
        const stocks = await this.prisma.stock.findMany({
          where: { stock_id: { in: result.map((r) => r.stock_id) } },
          select: { stock_id: true, name: true },
        });
        const nameMap = new Map(stocks.map((s) => [s.stock_id, s.name]));
        for (const row of result) row.name = nameMap.get(row.stock_id) ?? null;
      }

      const endTime = new Date();
      const executionTime = endTime - startTime;
      console.log("getStockTrackingList query execution time:", executionTime, "milliseconds");
      return result;
  }

  async addStockToTrackinglist(inputData) {
    const createdUserStock = await this.prisma.user_stock.create({
      data: {
        user_id: Number(inputData.user_id),
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
          user_id: Number(inputData.user_id),
          stock_id: inputData.stock_id,
        },
      },
    });
    return deletedUserStock;
  }

  // Bulk-upsert one trading day's OHLC. Idempotent and self-correcting:
  // re-running a day overwrites its values (via ON DUPLICATE KEY UPDATE on the
  // (stock_id, trade_date) unique key), so a schema change / data fix picked up
  // on a re-run is applied to existing rows too.
  async insertDailyPrices(rows) {
    if (!rows || rows.length === 0) return { count: 0 };
    const values = Prisma.join(
      rows.map(
        (r) => Prisma.sql`(${r.stock_id}, ${r.name}, ${r.trade_date}, ${r.open}, ${r.high}, ${r.low}, ${r.close}, ${r.volume})`
      )
    );
    const affected = await this.prisma.$executeRaw`
      INSERT INTO daily_price (stock_id, name, trade_date, open, high, low, close, volume)
      VALUES ${values}
      ON DUPLICATE KEY UPDATE
        name = VALUES(name), open = VALUES(open), high = VALUES(high),
        low = VALUES(low), close = VALUES(close), volume = VALUES(volume)`;
    return { count: affected };
  }

  // Upsert the stock master (stock_id -> name). Called during ingestion.
  async upsertStocks(rows) {
    if (!rows || rows.length === 0) return { count: 0 };
    const map = new Map();
    for (const r of rows) map.set(r.stock_id, r.name ?? null);
    const values = Prisma.join(
      [...map].map(([stock_id, name]) => Prisma.sql`(${stock_id}, ${name})`)
    );
    const affected = await this.prisma.$executeRaw`
      INSERT INTO stock (stock_id, name)
      VALUES ${values}
      ON DUPLICATE KEY UPDATE name = VALUES(name)`;
    return { count: affected };
  }

  // How many distinct trading days are already stored for a given date.
  async countStocksOnDate(tradeDate) {
    return await this.prisma.daily_price.count({
      where: { trade_date: tradeDate },
    });
  }

  // Most recent trade_date present in daily_price (null if empty).
  async getLatestTradeDate() {
    const row = await this.prisma.daily_price.findFirst({
      orderBy: { trade_date: "desc" },
      select: { trade_date: true },
    });
    return row?.trade_date ?? null;
  }

  // Latest `period` trading dates on/before anchorDate, plus every
  // (stock_id, name, trade_date, close) row inside that window.
  async getPriceWindow(anchorDate, period) {
    const dates = await this.prisma.daily_price.findMany({
      where: { trade_date: { lte: anchorDate } },
      distinct: ["trade_date"],
      orderBy: { trade_date: "desc" },
      take: period,
      select: { trade_date: true },
    });
    if (dates.length === 0) return { dates: [], rows: [] };
    const minDate = dates[dates.length - 1].trade_date;
    const rows = await this.prisma.daily_price.findMany({
      where: { trade_date: { gte: minDate, lte: anchorDate }, close: { not: null } },
      select: { stock_id: true, name: true, trade_date: true, close: true },
      orderBy: [{ stock_id: "asc" }, { trade_date: "asc" }],
    });
    return { dates: dates.map((d) => d.trade_date).reverse(), rows };
  }

  async updateSpecifiedStockTrackingData(inputData) {
    try {
      const updatedUserStock = await this.prisma.user_stock.update({
        where: {
          stock_id_user_id: {
            user_id: Number(inputData.user_id),
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
