import axios from 'axios';
import { fetchTimeout, timeoutPromise } from '../../core/application/custom_util_service.js';

const newStockHandler = (stocksService) => {
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
        const data = await timeoutPromise(
          stocksService.ETF_DividendYieldRanking(),
          8000
        );
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    getStockTrackinglist: async (req, res) => {
      const userId = req.params.userID;
      try {
        const trackinglist = await stocksService.getStockTrackinglist(
          userId,
          req.query?.contains_is_blocked
        );
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
        const filterlist = await stocksService.listOf_ETF_NotTrackedByTheUser(
          userId,
          percentage,
          value
        );
        res.json(filterlist);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    addStockToTrackinglist: async (req, res) => {
      const userID = req.params.userID;
      const { stockID, note } = req.body;
      try {
        const trackinglist = await stocksService.addStockToTrackinglist(
          userID,
          stockID,
          note
        );
        res.json(trackinglist);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    updateSpecifiedStockNote: async (req, res) => {
      const userID = req.params.userID;
      const { stockID, note } = req.body;
      try {
        const trackinglist = await stocksService.updateSpecifiedStockNote(
          userID,
          stockID,
          note
        );
        res.json(trackinglist);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },

    deleteStockTrackinglist: async (req, res) => {
      const userID = req.params.userID;
      const { stockID } = req.query;
      try {
        const trackinglist = await stocksService.deleteStockTrackinglist(
          userID,
          stockID
        );
        res.json(trackinglist);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    threeMajorInstitutionalInvestors: async (req, res) => {
      try {
        const data = await timeoutPromise(
          stocksService.threeMajorInstitutionalInvestors(),
          8000
        );
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
        const data = await timeoutPromise(
          stocksService.theLatestOpeningDate(),
          8000
        );
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    dailyTransactionInfoOfIndividualStock: async (req, res) => {
      const stockNo = req.params.stockNo;
      const date = req.query.date;
      try {
        const data = await timeoutPromise(
          stocksService.dailyTransactionInfoOfIndividualStock(stockNo, date),
          8000
        );
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    dailyTransactionInfoOfIndividualStockWithThreeMonths: async (req, res) => {
      const stockNo = req.params.stockNo;
      try {
        const data = await timeoutPromise(
          stocksService.dailyTransactionInfoOfIndividualStockWithMonths(
            stockNo
          ),
          8000
        );
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    simpleMovingAverage: async (req, res) => {
      const stockNo = req.params.stockNo;
      if (!stockNo) {
        return res.status(400).json({ error: "Stock number is required" });
      }

      const data = await timeoutPromise(
        stocksService.simpleMovingAverage(stockNo),
        8000
      );
      if (typeof data === 'string' && data.includes('Cannot read properties of undefined')) {
        return res.status(400).json({ error: '股票代號有誤' });
      }
      res.json(data);
    },

    dailyMarketTrading: async (req, res) => {
      try {
        const data = await timeoutPromise(
          stocksService.dailyMarketTrading(),
          8000
        );
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    dailyClosingQuote: async (req, res) => {
      try {
        const data = await timeoutPromise(
          stocksService.dailyClosingQuote(),
          8000
        );
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    top20SecuritiesByTradingVolume: async (req, res) => {
      try {
        const data = await timeoutPromise(
          stocksService.top20_SecuritiesByTradingVolume(),
          8000
        );
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    stockMarketOpeningAndClosingDates: async (req, res) => {
      const requestAllData = req.query.requestAllData === "true";
      try {
        const data = await timeoutPromise(
          stocksService.stockMarketOpeningAndClosingDates(requestAllData),
          8000
        );
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    fiveLevelsOfStockInformation: async (req, res) => {
      const stockNo = req.params.stockNo;
      try {
        const data = await timeoutPromise(
          stocksService.fiveLevelsOfStockInformation(stockNo),
          8000
        );
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  };
};

export default newStockHandler;
