import express from 'express';
import GetStocksService from '../Services/GetStocksService.js';
const appRouter  = express.Router();
import axios from "axios";

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
 *         description: Successful response data.
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
 *         description: Successful response data.
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
 * /getDailyMarketTrading:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 每日市場成交資訊
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response.
 */
appRouter.get("/getDailyMarketTrading", async (req, res) => {
  try {
    const data = await GetStocksService.getDailyMarketTrading();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /getDailyClosingQuote:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 每日收盤行情
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response.
 */
appRouter.get("/getDailyClosingQuote", async (req, res) => {
  try {
    const data = await GetStocksService.getDailyClosingQuote();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /getTop20_SecuritiesByTradingVolume:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 成交量前二十名證券
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response.
 */
appRouter.get("/getTop20_SecuritiesByTradingVolume", async (req, res) => {
  try {
    const data = await GetStocksService.getTop20_SecuritiesByTradingVolume();
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
 *         description: Successful response data.
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
 *         description: Successful response data.
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

// /**
//  * @swagger
//  * /getSecuritiesCompanyTransactionRecords/{stockNo}:
//  *   get:
//  *     tags:
//  *         - Stock
//  *     summary: 卷商分點進出
//  *     parameters:
//  *       - in: path
//  *         name: stockNo
//  *         required: true
//  *         description: Stock No
//  *         schema:
//  *           type: string
//  *     description: Returns 卷商分點進出 data.
//  *     responses:
//  *       200:
//  *         description: Successful response data.
//  */
// appRouter.get("/getSecuritiesCompanyTransactionRecords/:stockNo", async (req, res) => {
//   try {
//     const stockNo = req.params.stockNo;
//     const data = await GetStocksService.getSecuritiesCompanyTransactionRecords(stockNo);
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


/**
 * @swagger
 * /getSecuritiesCompanyTransactionRecords/{stockNo}:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 卷商分點進出
 *     parameters:
 *       - in: path
 *         name: stockNo
 *         required: true
 *         description: Stock No
 *         schema:
 *           type: string
 *       - in: query
 *         name: displayMethod
 *         required: true
 *         description: 指定顯示資料方法
 *         schema:
 *           type: string
 *           enum: ['All','Overbuy', 'OverSold']
 *       - in: query
 *         name: sortBy
 *         required: false
 *         description: 排序方式
 *         schema:
 *           type: string
 *           enum: ['ASC','DESC']
 *         default: ASC
 *     responses:
 *       200:
 *         description: Successful response data.
 */
appRouter.get("/getSecuritiesCompanyTransactionRecords/:stockNo/", async (req, res) => {
  try {
    const data = await GetStocksService.getSecuritiesCompanyTransactionRecords(req);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default appRouter ;
