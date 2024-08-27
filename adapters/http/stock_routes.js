import express from 'express';
import StockController from './stock_handler.js';




const express_router = express.Router();
import StockRepositoryInstance from '../../Database/prisma/StockRepository.js';
import StocksService from '../../core/application/StocksService.js';
const stockService = new StocksService(StockRepositoryInstance);
const stockController = StockController(stockService);


/**
 * @swagger
 * /stock/trackinglist/{userID}:
 *   get:
 *     tags:
 *       - Database
 *     summary: 取得使用者追蹤股票名單
 *     description: Get user tracking stock data.
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         description: 使用者ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: contains_is_blocked
 *         required: true
 *         description: 包含封鎖的股票
 *         schema:
 *           type: string
 *           enum: [true,false]
 *         default: false
 *     responses:
 *       200:
 *         description: 成功取得使用者資料。
 */
express_router.get("/stock/trackinglist/:userID", stockController.getStockTrackinglist);

/**
 * @swagger
 * /stock/list-of-etf-not-tracked-by-the-user/{userID}:
 *   get:
 *     tags:
 *       - Database
 *     summary: 取得使用者未追蹤股票比對ETF名單。
 *     description: Get a list of stock comparison ETFs not tracked by the user.
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
express_router.get("/stock/list-of-etf-not-tracked-by-the-user/:userID", stockController.listOfETFNotTrackedByTheUser);

/**
 * @swagger
 * /stock/trackinglist/{userID}:
 *   post:
 *     deprecated: false
 *     tags:
 *       - Database
 *     summary: 新增收藏股票
 *     description: Add a new stock to the user's trackinglist.
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               stockID:
 *                 type: string
 *                 required: true
 *                 description: Stock ID
 *               note:
 *                 type: string
 *                 description: Note
 *                 default: ''
 *     responses:
 *       200:
 *         description: Success message indicating the stock was added to the trackinglist.
 *       400:
 *         description: Invalid request body or missing required fields.
 *       500:
 *         description: Internal server error.
 */
express_router.post("/stock/trackinglist/:userID", stockController.addStockToTrackinglist);

/**
 * @swagger
 * /stock/trackinglist/{userID}/update-specified-stock-note:
 *   patch:
 *     deprecated: false
 *     tags:
 *       - Database
 *     summary: 更新指定股票備註
 *     description: Update specified stock remarks
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               stockID:
 *                 type: string
 *                 required: true
 *                 description: Stock ID
 *               note:
 *                 type: string
 *                 required: true
 *                 description: 備註
 *     responses:
 *       200:
 *         description: Success message indicating the stock was updated in the trackinglist.
 */
express_router.patch("/stock/trackinglist/:userID/update-specified-stock-note", stockController.updateSpecifiedStockNote);

/**
 * @swagger
 * /stock/trackinglist/{userID}:
 *   delete:
 *     tags:
 *       - Database
 *     summary: 刪除指定收藏的股票
 *     description: Delete the specified stock from the user's tracking list.
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: stockID
 *         required: true
 *         description: Stock ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success message indicating the stock was updated in the trackinglist.
 */
express_router.delete("/stock/trackinglist/:userID", stockController.deleteStockTrackinglist);







/**
 * @swagger
 * /stock/test-stock:
 *   get:
 *     deprecated: true
 *     tags:
 *         - Test
 *     summary: TestStock
 *     description:
 */
express_router.get("/stock/test-stock", stockController.testStock);

/**
 * @swagger
 * /stock/etf-dividend-yield-ranking:
 *   get:
 *     tags:
 *         - Stock
 *     summary: ETF殖利率排行
 *     description: Returns ETF Yield Ranking data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/etf-dividend-yield-ranking", stockController.etfDividendYieldRanking);


/**
 * @swagger
 * /stock/three-major-institutional-investors:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 三大法人買賣超日報
 *     description: Returns 三大法人買賣超日報 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/three-major-institutional-investors", stockController.threeMajorInstitutionalInvestors);

/**
 * @swagger
 * /stock/fake-api:
 *   get:
 *     tags:
 *       - Test
 *     summary: Fake API endpoint
 *     description: Returns fake API data.
 */
express_router.get('/fake-api', stockController.fakeApi);



/**
 * @swagger
 * /stock/the-latest-opening-date:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 最後一次開盤日期
 *     description: Returns 最後一次開盤日期 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/the-latest-opening-date", stockController.theLatestOpeningDate);

/**
 * @swagger
 * /stock/daily-transaction-info-of-individual-stock/{stockNo}:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 個股當月日成交資訊
 *     description: Returns data.
 *     parameters:
 *       - in: path
 *         name: stockNo
 *         required: true
 *         description: Stock No
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         description: date_example:20240401
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/daily-transaction-info-of-individual-stock/:stockNo", stockController.dailyTransactionInfoOfIndividualStock);

/**
 * @swagger
 * /stock/daily-transaction-info-of-individual-stock-with-three-months/{stockNo}:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 個股三個月日成交資訊
 *     description: Returns data.
 *     parameters:
 *       - in: path
 *         name: stockNo
 *         required: true
 *         description: Stock No
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         description: date_example:20240401
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/daily-transaction-info-of-individual-stock-with-three-months/:stockNo", stockController.dailyTransactionInfoOfIndividualStockWithThreeMonths);

/**
 * @swagger
 * /stock/simple-moving-average:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 簡單移動平均線
 *     description: Returns 簡單移動平均線 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/simple-moving-average", stockController.simpleMovingAverage);

/**
 * @swagger
 * /stock/daily-market-trading:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 每日市場交易
 *     description: Returns 每日市場交易 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/daily-market-trading", stockController.dailyMarketTrading);

/**
 * @swagger
 * /stock/daily-closing-quote:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 每日收盤報價
 *     description: Returns 每日收盤報價 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/daily-closing-quote", stockController.dailyClosingQuote);

/**
 * @swagger
 * /stock/top20-securities-by-trading-volume:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 20大成交量股票
 *     description: Returns 20大成交量股票 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/top20-securities-by-trading-volume", stockController.top20SecuritiesByTradingVolume);

/**
 * @swagger
 * /stock/stock-market-opening-and-closing-dates:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 股市開盤及收盤日期
 *     description: Returns 股市開盤及收盤日期 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/stock-market-opening-and-closing-dates", stockController.stockMarketOpeningAndClosingDates);

/**
 * @swagger
 * /stock/five-levels-of-stock-information/{stockNo}:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 股票五檔資訊
 *     description: Returns 股票五檔資訊 data.
 *     parameters:
 *       - in: path
 *         name: stockNo
 *         required: true
 *         description: Stock No
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/stock/five-levels-of-stock-information/:stockNo", stockController.fiveLevelsOfStockInformation);

export default express_router;
