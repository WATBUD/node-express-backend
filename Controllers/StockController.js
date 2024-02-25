//吃飯有事留言~~~

import express from 'express';
import GetStocksService from '../Services/GetStocksService.js';
const appRouter  = express.Router();
/**
 * @swagger
 * /getThreeMajorInstitutionalInvestors:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 三大法人買賣超日報
 *     description: Returns 三大法人買賣超日報 data.
 *     responses:
 *       200:
 *         description: Successful response with 三大法人買賣超日報 and NordVPN data.
 */
appRouter.get("/getThreeMajorInstitutionalInvestors", async (req, res) => {
  try {
    const data = await GetStocksService.getThreeMajorInstitutionalInvestors(); 
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/**
 * @swagger
 * /getTheLatestOpeningDate:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 最後一次開盤日期
 *     description: Returns 最後一次開盤日期 data.
 *     responses:
 *       200:
 *         description: Successful response with 最後一次開盤日期 and NordVPN data.
 */
appRouter.get("/getTheLatestOpeningDate", async (req, res) => {
    try {
      const data = await GetStocksService.getTheLatestOpeningDate();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /getStockMarketOpeningAndClosingDates:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 市場開休市日期
 *     description: Returns 市場開休市日期 data.
 *     responses:
 *       200:
 *         description: Successful response with 市場開休市日期 and NordVPN data.
 */
appRouter.get("/getStockMarketOpeningAndClosingDates", async (req, res) => {
    try {
        const requestAllData = req.query.requestAllData === 'true'; // 将查询参数转换为布尔值
        const data = await GetStocksService.getStockMarketOpeningAndClosingDates(requestAllData); 
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * @swagger
 * /getFiveLevelsOfStockInformation/{stockNo}:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 取得股票五檔
 *     parameters:
 *       - in: path
 *         name: stockNo
 *         required: true
 *         description: Stock No
 *         schema:
 *           type: string
 *     description: Returns 取得股票五檔 data.
 *     responses:
 *       200:
 *         description: Successful response with 取得股票五檔 and NordVPN data.
 */
appRouter.get("/getFiveLevelsOfStockInformation/:stockNo", async (req, res) => {
    try {
      const stockNo = req.params.stockNo;
      const data = await GetStocksService.getFiveLevelsOfStockInformation(stockNo);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });









export default appRouter ;
