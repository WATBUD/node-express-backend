//吃飯有事留言~~~

import express from 'express';
import GetStocksService from '../Services/GetStocksService.js';
const appRouter  = express.Router();
import axios from "axios";
import cheerio from "cheerio";
import iconv from 'iconv-lite';


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
 * /getTheLatestOpeningDate:
 *   get:
 *     tags:
 *         - Stock
 *     summary: 最後一次開盤日期
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response.
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
 *     description: Returns 卷商分點進出 data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
appRouter.get("/getSecuritiesCompanyTransactionRecords/:stockNo", async (req, res) => {
  const stockNo = req.params.stockNo;
  try {
    const url = `https://fubon-ebrokerdj.fbs.com.tw/z/zc/zco/zco.djhtm?a=${stockNo}&e=2024-2-19&f=2024-2-19`;

    const response = await axios.get(url, {
      responseType: 'arraybuffer'  // 将响应类型设置为 arraybuffer
  });
  const htmlBuffer = response.data;
  const html = iconv.decode(htmlBuffer, 'big5'); // 使用 iconv-lite 解码 Big5 编码

  const $ = cheerio.load(html);
    
    // 选择所有符合条件的 <tr> 元素
    const trElements = $('tr');
    const dataArray = [];

    // 定义用于存储结果的数组
    const result = [];
    console.log(
      "%c getSecuritiesCompanyTransactionRecords",
      "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
      // "tdContentArray",
      // tdContentArray,
      "trElements",
      trElements,
    );
    function getTextFromTd(tdElement) {
      const anchorElement = $(tdElement).find('a');
      if (anchorElement.length > 0) {
        return anchorElement.text().trim();
      } else {
        return $(tdElement).text().trim();
      }
    }
    trElements.each((index, element) => {
      // 获取当前 <tr> 元素下的所有 <td> 元素
      const tdElements = $(element).find('td');
      

      // 如果 <td> 元素数量为 10，说明这是您想要的格式
      if (tdElements.length === 10) {
        // 创建一个对象来存储 <td> 元素的文本内容
        const dataObject = {
          securitiesDealer: $(tdElements[0]).text().trim(),
          buyingIn: $(tdElements[1]).text().trim(),
          sellingOut: $(tdElements[2]).text().trim(),
          totalDifference: $(tdElements[6]).text().trim()-$(tdElements[7]).text().trim(), //$(tdElements[3]).text().trim(),
          percentage: $(tdElements[4]).text().trim(),
        };
        const dataObject2 = {
          securitiesDealer: $(tdElements[5]).text().trim(),
          buyingIn: $(tdElements[6]).text().trim(),
          sellingOut: $(tdElements[7]).text().trim(),
          totalDifference: $(tdElements[6]).text().trim()-$(tdElements[7]).text().trim(), //$(tdElements[8]).text().trim(),
          percentage: $(tdElements[9]).text().trim(),
        };

        if (dataObject.percentage !== "佔成交比重") {
          dataArray.push(dataObject);
        }
        if (dataObject2.percentage !== "佔成交比重") {
          dataArray.push(dataObject2);
        }
      }
    });

    dataArray.sort((a, b) => {
      // 将百分比字符串转换为数字，去除百分号并转换为浮点数进行比较
      const percentageA = parseFloat(a.percentage.replace('%', ''));
      const percentageB = parseFloat(b.percentage.replace('%', ''));
      // 比较百分比值并返回排序结果
      return percentageB - percentageA;
    });
    res.json(dataArray);
    //return dataArray;
  } catch (error) {
    // 如果请求发生错误，返回错误状态码和错误信息
    res.status(500).json({ error: error.message });
  }
});






export default appRouter ;
