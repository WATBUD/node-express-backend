import express from 'express';
import StocksService from '../Services/StocksService.js';
const appRouter  = express.Router();
import axios from "axios";
import { fetchTimeout,timeoutPromise } from '../Services/CustomUtilService.js';
import multer from 'multer';
const formData_Middlewares_multer = multer();//解析form data的中間件


/**
 * @swagger
 * /stock/TestStock:
 *   get:
 *     deprecated: true
 *     tags:
 *         - Stock
 *     summary: TestStock
 *     description:
 */
appRouter.get("/stock/TestStock", async (req, res) => {
  try {

  } catch (error) {
  }
});






/**
 * @swagger
 * /stock/ETF_DividendYieldRanking:
 *   get:
 *     tags:
 *         - Stock
 *     summary: ETF殖利率排行
 *     description: Returns ETF殖利率排行 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
appRouter.get("/stock/ETF_DividendYieldRanking", async (req, res) => {
  try {
    const data = await timeoutPromise(StocksService.ETF_DividendYieldRanking(), 8000);
    console.log('_trackinglist=>>>', data);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




/**
 * @swagger
 * /stock/trackinglist/{userID}:
 *   get:
 *     tags:
 *       - Stock
 *     summary: 取得使用者追蹤股票名單
 *     description: 取得使用者追蹤股票資料。
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         description: 使用者ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_blocked
 *         required: true
 *         description: 是否封鎖
 *         schema:
 *           type: string
 *           enum: [true,false]
 *         default: false
 * 
 *     responses:
 *       200:
 *         description: 成功取得使用者資料。
 */
appRouter.get("/stock/trackinglist/:userID", async (req, res) => {
  const userId = req.params.userID;
  console.log('req.params=>>>', req.params);
  console.log('req.query=>>>', req.query);
  try {
    const _trackinglist = await StocksService.getStockTrackinglist(userId,req.query?.is_blocked);
  
    //console.log('_trackinglist=>>>', _trackinglist);

  
    res.json(_trackinglist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
});




/**
 * @swagger
 * /stock/listOf_ETF_NotTrackedByTheUser/{userID}:
 *   get:
 *     tags:
 *       - Stock
 *     summary: 取得使用者未追蹤股票比對ETF名單。
 *     description: 取得使用者未追蹤股票比對ETF名單。
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         description: 使用者ID
 *         schema:
 *           type: string
 *         default: "111"
 *       - in: query
 *         name: percentage
 *         required: false
 *         description: 指定殖利率多少以上(ex:20)。
 *         schema:
 *           type: string
 *         default: "5.5"
 *       - in: query
 *         name: value
 *         required: false
 *         description: 指定股價價格多少以上。
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功取得資料。
 */



appRouter.get("/stock/listOf_ETF_NotTrackedByTheUser/:userID", async (req, res) => {
  const userId = req.params.userID;
  const percentage = req.query.percentage; // 默认为 100%
  const value = req.query.value; // 默认为 100%

  console.log('req.params.id=>>>', userId);
  try {
    const _filterlist = await StocksService.listOf_ETF_NotTrackedByTheUser(userId,percentage,value);
    console.log('_filterlist=>>>', _filterlist);

    res.send(_filterlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
});





















/**
 * @swagger
 * /stock/trackinglist:
 *   post:
 *     deprecated: false
 *     tags:
 *       - Stock
 *     summary: Add new stock to trackinglist
 *     description: Add a new stock to the user's trackinglist.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 required: true
 *                 description: User ID
 *               stockID:
 *                 type: string
 *                 required: true
 *                 description: Stock ID
 *               note:
 *                 type: string
 *                 description: 備註
 *     responses:
 *       200:
 *         description: Success message indicating the stock was added to the trackinglist.
 *       400:
 *         description: Invalid request body or missing required fields.
 *       500:
 *         description: Internal server error.
 */

appRouter.post("/stock/trackinglist",formData_Middlewares_multer.none(),async (req, res) => {
  const { userID, stockID,note } = req.body;
  console.log(
    "%c /stock/trackinglist",
    "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
    req.body,
  );
  if (!userID || !stockID) {
    return res.status(400).json({ error: "Invalid userID or stockID" });
  }

  try {
    const _trackinglist = await StocksService.createStockTrackinglist(userID,stockID,note);
    //res.status(200).json(user); 

    res.send(_trackinglist);

    _trackinglist
  } catch (error) {
    res.status(500).json({ error: error.message }); // 发送错误的响应
  }
});


/**
 * @swagger
 * /stock/trackinglist:
 *   delete:
 *     tags:
 *       - Stock
 *     summary: Delete specified stock
 *     description: Delete the specified stock from the user's tracking list.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userID:
 *                 type: string
 *                 description: User ID
 *               stockID:
 *                 type: string
 *                 description: Stock ID
 *     responses:
 *       200:
 *         description: Success message indicating the stock was added to the trackinglist.
 *       400:
 *         description: Invalid request body or missing required fields.
 *       500:
 *         description: Internal server error.
 */

appRouter.delete("/stock/trackinglist",formData_Middlewares_multer.none(),async (req, res) => {
  const { userID, stockID } = req.body;
  console.log(
    "%c /stock/trackinglist",
    "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
    req.body,
  );
  if (!userID || !stockID) {
    return res.status(400).json({ error: "Invalid userID or stockID" });
  }

  try {
    const _trackinglist = await StocksService.deleteStockTrackinglist(userID,stockID);
    //res.status(200).json(user); 

    res.send(_trackinglist);

    _trackinglist
  } catch (error) {
    res.status(500).json({ error: error.message }); // 发送错误的响应
  }
});










/**
 * @swagger
 * /stock/threeMajorInstitutionalInvestors:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 三大法人買賣超日報
 *     description: Returns 三大法人買賣超日報 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
appRouter.get("/stock/threeMajorInstitutionalInvestors", async (req, res) => {
  try {
    const data = await timeoutPromise(StocksService.threeMajorInstitutionalInvestors(), 8000);
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
 * /stock/theLatestOpeningDate:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 最後一次開盤日期
 *     description: Returns 最後一次開盤日期 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
appRouter.get("/stock/theLatestOpeningDate", async (req, res) => {
    try {

      const data = await timeoutPromise(StocksService.theLatestOpeningDate(), 8000);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});


/**
 * @swagger
 * /stock/dailyMarketTrading:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 每日市場成交資訊
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response.
 */
appRouter.get("/stock/dailyMarketTrading", async (req, res) => {
  try {
    const data = await timeoutPromise(StocksService.dailyMarketTrading(), 8000);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /stock/dailyClosingQuote:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 每日收盤行情
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response.
 */
appRouter.get("/stock/dailyClosingQuote", async (req, res) => {
  try {
    const data = await timeoutPromise(StocksService.dailyClosingQuote(), 8000);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /stock/top20_SecuritiesByTradingVolume:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 成交量前二十名證券
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response.
 */
appRouter.get("/stock/top20_SecuritiesByTradingVolume", async (req, res) => {
  try {
    const data = await timeoutPromise(StocksService.top20_SecuritiesByTradingVolume(), 8000);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /stock/stockMarketOpeningAndClosingDates:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 市場開休市日期
 *     description: Returns 市場開休市日期 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
appRouter.get("/stock/stockMarketOpeningAndClosingDates", async (req, res) => {
    try {
        const requestAllData = req.query.requestAllData === 'true'; // 将查询参数转换为布尔值
        const data = await timeoutPromise(StocksService.stockMarketOpeningAndClosingDates(requestAllData), 8000);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /stock/fiveLevelsOfStockInformation/{stockNo}:
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
appRouter.get("/stock/fiveLevelsOfStockInformation/:stockNo", async (req, res) => {
    try {
      const stockNo = req.params.stockNo;
      const data = await timeoutPromise(StocksService.fiveLevelsOfStockInformation(stockNo), 8000);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


/**
 * @swagger
 * /stock/securitiesCompanyTransactionRecords/{stockNo}:
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
appRouter.get("/stock/securitiesCompanyTransactionRecords/:stockNo/", async (req, res) => {
  try {
    const data = await timeoutPromise(StocksService.securitiesCompanyTransactionRecords(req), 8000);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






export default appRouter ;
