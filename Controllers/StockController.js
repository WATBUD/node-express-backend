// routes.js

import express from 'express';
import GetStocksService from '../Services/GetStocksService.js';
const appRouter  = express.Router();

appRouter.get("/getThreeMajorInstitutionalInvestors", async (req, res) => {
  try {
    const data = await GetStocksService.getThreeMajorInstitutionalInvestors(); 
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

appRouter.get("/getTheLatestOpeningDate", async (req, res) => {
    try {
      const data = await GetStocksService.getTheLatestOpeningDate();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
appRouter.get("/getStockMarketOpeningAndClosingDates", async (req, res) => {
    try {
        const requestAllData = req.query.requestAllData === 'true'; // 将查询参数转换为布尔值
        const data = await GetStocksService.getStockMarketOpeningAndClosingDates(requestAllData); 
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



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
