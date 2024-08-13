import axios from 'axios';
import { fetchTimeout, timeoutPromise } from '../../core/application/CustomUtilService.js';

const StockController = (StocksService) => {
  return {
    testStock: async (req, res) => {
      try {
        // Implement the logic for /stock/TestStock
        res.send("TestStock endpoint is not yet implemented.");
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    etfDividendYieldRanking: async (req, res) => {
      try {
        const data = await timeoutPromise(StocksService.ETF_DividendYieldRanking(), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    getStockTrackinglist: async (req, res) => {
      const userId = req.params.userID;
      try {
        const trackinglist = await StocksService.getStockTrackinglist(userId, req.query?.contains_is_blocked);
        res.json(trackinglist);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    listOfETFNotTrackedByTheUser: async (req, res) => {
      const userId = req.params.userID;
      const percentage = req.query.percentage;
      const value = req.query.value;
      try {
        const filterlist = await StocksService.listOf_ETF_NotTrackedByTheUser(userId, percentage, value);
        res.json(filterlist);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    addStockToTrackinglist: async (req, res) => {
      const userID = req.params.userID;
      const { stockID, note } = req.body;
      try {
        const trackinglist = await StocksService.addStockToTrackinglist(userID, stockID, note);
        res.json(trackinglist);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    updateSpecifiedStockNote: async (req, res) => {
      const userID = req.params.userID;
      const { stockID, note } = req.body;
      try {
        const trackinglist = await StocksService.updateSpecifiedStockNote(userID, stockID, note);
        res.json(trackinglist);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },

    deleteStockTrackinglist: async (req, res) => {
      const userID = req.params.userID;
      const { stockID } = req.query;
      try {
        const trackinglist = await StocksService.deleteStockTrackinglist(userID, stockID);
        res.json(trackinglist);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    threeMajorInstitutionalInvestors: async (req, res) => {
      try {
        const data = await timeoutPromise(StocksService.threeMajorInstitutionalInvestors(), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    fakeApi: async (req, res) => {
      try {
        res.send("Fake API endpoint.");
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },


    theLatestOpeningDate: async (req, res) => {
      try {
        const data = await timeoutPromise(StocksService.theLatestOpeningDate(), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    dailyTransactionInfoOfIndividualStock: async (req, res) => {
      const stockNo = req.params.stockNo;
      const date = req.query.date;
      try {
        const data = await timeoutPromise(StocksService.dailyTransactionInfoOfIndividualStock(stockNo, date), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    dailyTransactionInfoOfIndividualStockWithThreeMonths: async (req, res) => {
      const stockNo = req.params.stockNo;
      try {
        const data = await timeoutPromise(StocksService.dailyTransactionInfoOfIndividualStockWithMonths(stockNo), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    simpleMovingAverage: async (req, res) => {
      const stockNo = req.params.stockNo;
      try {
        const data = await timeoutPromise(StocksService.simpleMovingAverage(stockNo), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    dailyMarketTrading: async (req, res) => {
      try {
        const data = await timeoutPromise(StocksService.dailyMarketTrading(), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    dailyClosingQuote: async (req, res) => {
      try {
        const data = await timeoutPromise(StocksService.dailyClosingQuote(), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    top20SecuritiesByTradingVolume: async (req, res) => {
      try {
        const data = await timeoutPromise(StocksService.top20_SecuritiesByTradingVolume(), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    stockMarketOpeningAndClosingDates: async (req, res) => {
      const requestAllData = req.query.requestAllData === 'true';
      try {
        const data = await timeoutPromise(StocksService.stockMarketOpeningAndClosingDates(requestAllData), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    fiveLevelsOfStockInformation: async (req, res) => {
      const stockNo = req.params.stockNo;
      try {
        const data = await timeoutPromise(StocksService.fiveLevelsOfStockInformation(stockNo), 8000);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  };
};

export default StockController;
