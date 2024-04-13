import express from 'express';
import GetStocksService from '../Services/GetStocksService.js';
const appRouter  = express.Router();
import axios from "axios";
import { fetchTimeout,timeoutPromise } from '../Services/CustomUtilService.js';

/**
 * @swagger
 * /threeMajorInstitutionalInvestors:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 三大法人買賣超日報
 *     description: Returns 三大法人買賣超日報 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
appRouter.get("/threeMajorInstitutionalInvestors", async (req, res) => {
  try {
    const data = await timeoutPromise(GetStocksService.threeMajorInstitutionalInvestors(), 8000);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

appRouter.get('/fake-api', (req, res) => {

   
});

appRouter.get('/testfakeApi', async (req, res) => {
  try {
    const fakeApiResponse = await fetchTimeout('http://localhost:9421/fake-api');
    res.json(fakeApiResponse);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




/**
 * @swagger
 * /theLatestOpeningDate:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 最後一次開盤日期
 *     description: Returns 最後一次開盤日期 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
appRouter.get("/theLatestOpeningDate", async (req, res) => {
    try {

      const data = await timeoutPromise(GetStocksService.theLatestOpeningDate(), 8000);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});


/**
 * @swagger
 * /dailyMarketTrading:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 每日市場成交資訊
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response.
 */
appRouter.get("/dailyMarketTrading", async (req, res) => {
  try {
    const data = await timeoutPromise(GetStocksService.dailyMarketTrading(), 8000);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /dailyClosingQuote:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 每日收盤行情
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response.
 */
appRouter.get("/dailyClosingQuote", async (req, res) => {
  try {
    const data = await timeoutPromise(GetStocksService.dailyClosingQuote(), 8000);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /top20_SecuritiesByTradingVolume:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 成交量前二十名證券
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response.
 */
appRouter.get("/top20_SecuritiesByTradingVolume", async (req, res) => {
  try {
    const data = await timeoutPromise(GetStocksService.top20_SecuritiesByTradingVolume(), 8000);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /stockMarketOpeningAndClosingDates:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 市場開休市日期
 *     description: Returns 市場開休市日期 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
appRouter.get("/stockMarketOpeningAndClosingDates", async (req, res) => {
    try {
        const requestAllData = req.query.requestAllData === 'true'; // 将查询参数转换为布尔值
        const data = await timeoutPromise(GetStocksService.stockMarketOpeningAndClosingDates(requestAllData), 8000);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /fiveLevelsOfStockInformation/{stockNo}:
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
appRouter.get("/fiveLevelsOfStockInformation/:stockNo", async (req, res) => {
    try {
      const stockNo = req.params.stockNo;
      const data = await timeoutPromise(GetStocksService.fiveLevelsOfStockInformation(stockNo), 8000);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// /**
//  * @swagger
//  * /securitiesCompanyTransactionRecords/{stockNo}:
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
// appRouter.get("/securitiesCompanyTransactionRecords/:stockNo", async (req, res) => {
//   try {
//     const stockNo = req.params.stockNo;
//     const data = await GetStocksService.securitiesCompanyTransactionRecords(stockNo);
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


/**
 * @swagger
 * /securitiesCompanyTransactionRecords/{stockNo}:
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
appRouter.get("/securitiesCompanyTransactionRecords/:stockNo/", async (req, res) => {
  try {
    const data = await timeoutPromise(GetStocksService.securitiesCompanyTransactionRecords(req), 8000);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default appRouter ;
