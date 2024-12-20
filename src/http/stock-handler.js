import axios from 'axios';
import { fetchTimeout, timeoutPromise } from '../services/custom-util-service.js';
import ResponseDTO from './api-response-dto.js';

const stockHandler = (stocksService) => {
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

    getStockTrackingList: async (req, res) => {
      const input = {
        ...req.params,
        ...req.body,
        ...req.user,
        ...req.query,
      };
      const result = await stocksService.getStockTrackingList(input);
      return res.json(result);
    },

    listOfETFNotTrackedByTheUser: async (req, res) => {
      const input = {
        ...req.params,
        ...req.body,
        ...req.user,
        ...req.query,
      };
      const result = await stocksService.listOf_ETF_NotTrackedByTheUser(input);
      return res.json(result);
    },

    addStockToTrackinglist: async (req, res) => {
      const input = {
        ...req.params,
        ...req.body,
        ...req.user,
      };
      const result = await stocksService.addStockToTrackinglist(input);
      return res.json(result);
    },

    updateSpecifiedStockTrackingData: async (req, res) => {
      const input = {
        ...req.params,
        ...req.body,
        ...req.user,
      };
      const result = await stocksService.updateSpecifiedStockTrackingData(input);
      return res.json(result);
    },

    deleteStockTrackinglist: async (req, res) => {
      const input = {
        ...req.params,
        ...req.body,
        ...req.user,
      };
      const result = await stocksService.deleteStockTrackinglist(input);
      return res.json(result);
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
      return res.json(ResponseDTO.successResponse("Fake API endpoint.",[]));

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
      if (
        typeof data === "string" &&
        data.includes("Cannot read properties of undefined")
      ) {
        return res.status(400).json({ error: "股票代號有誤" });
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

export default stockHandler;
