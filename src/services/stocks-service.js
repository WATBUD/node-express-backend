import axios from "axios";
import cheerio from "cheerio";
import iconv from 'iconv-lite';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
import {getFirstDayOfMonth,getLastThreeMonthsDates as getLastMonthsDates,dateToYYYYMMDD} from './custom-util-service.js';
import ResponseDTO from '../http/api-response-dto.js';
import stockRepository from '../repositories/stock-repository.js';

class StocksService {
  constructor() {
    if (!StocksService.instance) {
      StocksService.instance = this;
      this.StockRepository = stockRepository;
    }
    return StocksService.instance; // 如果已有實例，則返回現有實例
  }

  async getStockTrackingList(inputData) {
    try {
      const _trackinglist = await this.StockRepository.getStockTrackingList(inputData);

      if (_trackinglist) {
        const modifiedStocks = _trackinglist.map((stock) => {
          const { index, user_id, ...rest } = stock;
          return rest;
        });
        return ResponseDTO.successResponse(undefined,modifiedStocks);
      } else {
        return ResponseDTO.successResponse(undefined,[]);     
      }
    } catch (error) {
      return ResponseDTO.errorResponse("Error: " + error.message);   
    }
  }

  async listOf_ETF_NotTrackedByTheUser(inputData) {
    try {
      //const _ETFlist = await this.etfDividendYieldRanking();
      let [_usertrackinglist, etfList] = await Promise.all([
        this.StockRepository.getStockTrackingList(inputData),
        this.etfDividendYieldRanking(),
      ]);

      let filterlist = [];
      if (etfList && _usertrackinglist.length > 0) {
        if (inputData.percentage != null) {
          etfList = etfList.filter(
            (etfElement) => etfElement.dividendYield >= inputData.percentage
          );
        }
        if (inputData.value != null) {
          etfList = etfList.filter((etfElement) => etfElement.value <= inputData.value);
        }

        for (let index = 0; index < etfList.length; index++) {
          const etfElement = etfList[index];
          let found = false;

          for (let trackingItem = 0; trackingItem < _usertrackinglist.length; trackingItem++) {
            const _userElement = _usertrackinglist[trackingItem].stock_id;
            if (_userElement == etfElement.stockCode) {
              found = true;
              break;
            }
          }
          if (!found) {
            filterlist.push(etfElement);
          }
        }
        return ResponseDTO.successResponse(undefined,filterlist);
      } else {
        return ResponseDTO.successResponse(undefined,[]);
      }
    } catch (error) {
      return ResponseDTO.errorResponse("Error: " + error.message);   
    }
  }

  async etfDividendYieldRanking() {
    try {
      //const stockNo = req.params.stockNo;
      console.log(
        "%c etfDividendYieldRanking",
        "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold"
        // "req.params",
        // req.params,
        // "req.query",
        // req.query
      );
      const url = `https://www.moneydj.com/etf/x/rank/rank0005.xdjhtm?erank=yeild&eord=t800880`;

      const headers = {
        //'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        // 'Accept-Encoding': 'gzip, deflate, br, zstd',
        // 'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
        "Cache-Control": "no-cache",
        //'Connection': 'keep-alive',
        //'Cookie': 'djaid=1.cfff769e-f4f2-43ee-b895-11b88688767b.1690828117.1039206186.0.0.32ce3; memlog=06dfd227-c4b1-46bc-abf8-db3c4903e021; _ss_pp_id=1f3f2486f4165202b8f1678011359496; _fbp=fb.2.1712889288530.173557996; _td=0a4d829a-85dd-4024-a9d1-c7dbfcb40eeb; USER=; ASP.NET_SessionId=fc0tyk55uqmpxr45udoa3e45; FI=FI_E:00690.TW^$^FI_E:00918.TW^$^FI_E:00733.TW',
        //'Host': 'www.moneydj.com',
        //'Pragma': 'no-cache',
        //'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        //'Sec-Ch-Ua-Mobile': '?0',
        // 'Sec-Ch-Ua-Platform': '"Windows"',
        // 'Sec-Fetch-Dest': 'document',
        // 'Sec-Fetch-Mode': 'navigate',
        // 'Sec-Fetch-Site': 'none',
        // 'Sec-Fetch-User': '?1',
        // 'Upgrade-Insecure-Requests': '1',
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      };

      const response = await axios.get(url, {
        headers,
        responseType: "arraybuffer", 
      });

      const htmlBuffer = response.data;
      const html = iconv.decode(htmlBuffer, "utf8");
      const $ = cheerio.load(html);

      const trElements = $("tr");
      let dataArray = [];
      // console.log(
      //   "%c securitiesCompanyTransactionRecords",
      //   "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
      //   "trElements",
      //   trElements
      // );

      //选择每个<tr>元素
      $("tr").each((index, element) => {
        const $element = $(element);

        // 提取href属性
        const href = $element.find("td.col01 a").attr("href");

        // 提取其他列的文本内容

        const stockCode = $element.find("td.col01 a").text();
        const stockName = $element.find("td.col02 a").text();
        const latestDate = $element.find("td.col03").text();
        const value = $element.find("td.col04").text();
        const establishmentAge = $element.find("td.col06").text();
        const dividendYield = $element.find("td.col07").text();
        const managementFee = $element.find("td.col09").text();
        const itemData = {
          stockCode,
          stockName,
          dividendYield,
          latestDate,
          establishmentAge,
          value,
          managementFee,
        };
        if (stockCode.trim() !== "") dataArray.push(itemData);
      });
      //console.log(itemData);
      return dataArray;
    } catch (error) {
      console.log(
        "%c securitiesCompanyTransactionRecords",
        "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
        "error:",
        error
      );
      return error.message;
    }
  }

  async addStockToTrackinglist(inputData) {
    try {
      const _result = await this.StockRepository.addStockToTrackinglist(inputData);     
      return ResponseDTO.successResponse(undefined,_result);
    } catch (error) {
      const errorMessages = ["too long", "stock_id_check"];
      if (errorMessages.some((msg) => error.message.includes(msg))) {
        return  ResponseDTO.errorResponse("The stock ID is not in the correct format.", null);
      }
      if (error.message.includes("Unique constraint")) {
        return ResponseDTO.errorResponse("You have saved this stock to your favorites.");
      }   

      return ResponseDTO.errorResponse("Error: " + error.message);   
    }
  }

  async updateSpecifiedStockTrackingData(inputData) {
    try {
      const _result = await this.StockRepository.updateSpecifiedStockTrackingData(inputData);     
      return ResponseDTO.successResponse(undefined,_result);
    } catch (error) {
      return ResponseDTO.errorResponse("Error: " + error.message);   
    }
  }

  async deleteStockTrackinglist(inputData) {
    try {
      const _result = await this.StockRepository.deleteStockTrackinglist(inputData);
      return ResponseDTO.successResponse(undefined,_result);
    } catch (error) {
      if (error.code === "P2025") {// P2025 is Prisma 唯一約束的錯誤碼
        return ResponseDTO.errorResponse("使用者未收藏此股票");   
      }
      return ResponseDTO.errorResponse("Error: " + error.message);   
    }
  }


  async fiveLevelsOfStockInformation(stockCode) {
    try {
      const apiUrl = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${stockCode}.tw&json=1&delay=0&_=1701445552510`;

      const response = await axios.get(apiUrl);

      if (response.status === 200) {
        return response.data;
      } else {
        return `HTTP请求失败，状态码：${response.status}`;
      }
    } catch (error) {
      return `Error：${error.message}`;
    }
  }

  async dailyTransactionInfoOfIndividualStock(
    stockNo,
    date = dateToYYYYMMDD(new Date())
  ) {
    try {
      //const firstDayOfMonth = getFirstDayOfMonth(month,year);
      const apiUrl = `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${date}&stockNo=${stockNo}&response=json&_=1715672258016`;

      const response = await axios.get(apiUrl);
      if (!response.data.data) {
        return "很抱歉，沒有符合條件代號與月份資料!";
      }
      if (response.status === 200 && response.data.data.length > 0) {
        const responseData = response.data;
        response.data.data = response.data.data.reverse();
        return responseData;
      }
    } catch (error) {
      return `Error：${error.message}`;
    }
  }

  async dailyTransactionInfoOfIndividualStockWithMonths(stockNo,times=3) {
    try {

      const currentDate = new Date(); 
      const yearStr = currentDate.getFullYear();
      const threeMonthsDates = getLastMonthsDates(yearStr, currentDate.getMonth() + 1,times);
      
      const promises = [];

      for (let i = 0; i < threeMonthsDates.length; i++) {
          promises.push(this.dailyTransactionInfoOfIndividualStock(stockNo, threeMonthsDates[i]));
      }

      const results = await Promise.all(promises);
      const combinedData = results.reduce((accumulated, current) => accumulated.concat(current.data), []);
      return combinedData;
    } catch (error) {
      return "Error: " + error.message;
    }
  }

  async simpleMovingAverage(stockNo) {
    try {
      function calculateAverage(closingPrices, days) {
        if (closingPrices.length < days) return null;
        const sum = closingPrices
          .slice(0, days)
          .reduce((total, price) => total + price, 0);
        return sum / days;
      }

      const rawData =await this.dailyTransactionInfoOfIndividualStockWithMonths(stockNo,4);
      const closingPrices = rawData.map((entry) => parseFloat(entry[6])); // 提取收盘价并转换为浮点数

      const movingAverages = {
        "5-day": calculateAverage(closingPrices, 5),
        "10-day": calculateAverage(closingPrices, 10),
        "20-day": calculateAverage(closingPrices, 20),
        "60-day": calculateAverage(closingPrices, 60),
      };

      console.log(movingAverages);

      return movingAverages;
    } catch (error) {
      return "Error: " + error.message;
      //console.error('An error occurred:', error);
    }
  }

  async dailyMarketTrading() {
    try {
      const apiUrl =
        "https://www.twse.com.tw/rwd/zh/afterTrading/FMTQIK?response=json&_=1709117440570";
      const response = await axios.get(apiUrl);
      if (response.status === 200 && response.data.data.length > 0) {
        const responseBody = response.data;
        return responseBody;
      } else {
        console.log(
          "%c dailyMarketTrading",
          "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
          "req:",
          req
        );
      }
    } catch (error) {
      return `Error：${error.message}`;
    }
  }

  async dailyClosingQuote() {
    try {
      const apiUrl =
        "https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?response=json&_=1709118194485";
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        const responseData = response.data;
        console.log(
          "%c response",
          "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
          "response:",
          response
        );
        return responseData;
      } else {
        console.log(
          "%c dailyClosingQuote",
          "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
          "req:",
          req
        );
      }
    } catch (error) {
      return `Error：${error.message}`;
    }
  }

  async top20_SecuritiesByTradingVolume() {
    try {
      const latestOpeningDate = await this.theLatestOpeningDate();
      const apiUrl = `https://www.twse.com.tw/rwd/zh/fund/T86?date=${latestOpeningDate}&selectType=ALL&response=json`;
      const response = await axios.get(apiUrl);

      if (response.status == 200) {
        console.log(
          "%c top20_SecuritiesByTradingVolume",
          "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
          latestOpeningDate,
          response
        );
        const _data = (response.data.data || []).slice(0, 20);
        response.data.data = _data;
        return response.data;
      }
    } catch (error) {
      return `Error：${error.message}`;
    }
  }

  async threeMajorInstitutionalInvestors() {
    try {
      const latestOpeningDate = await this.theLatestOpeningDate();
      console.log(
        "%c latestOpeningDate",
        "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
        latestOpeningDate
      );
      const apiUrl = `https://wwwc.twse.com.tw/rwd/zh/fund/T86?date=${latestOpeningDate}&selectType=ALL&response=json`;

      const response = await axios.get(apiUrl);

      if (response.status === 200) {
        //const data = response.data.data || [];
        const data = (response.data.data || []).slice(0, 100);
        return data;
      } else {
        return `HTTP请求失败，状态码：${response.status}`;
      }
    } catch (error) {
      return `Error：${error.message}`;
    }
  }

  async securitiesCompanyTransactionRecords(req) {
    try {
      const stockNo = req.params.stockNo;
      console.log(
        "%c securitiesCompanyTransactionRecords",
        "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
        "req.params",
        req.params,
        "req.query",
        req.query
      );
      const url = `https://fubon-ebrokerdj.fbs.com.tw/z/zc/zco/zco.djhtm?a=${stockNo}&e=2024-2-19&f=2024-2-19`;

      const response = await axios.get(url, {
        responseType: "arraybuffer", // 将响应类型设置为 arraybuffer
      });
      const htmlBuffer = response.data;
      const html = iconv.decode(htmlBuffer, "big5"); // 使用 iconv-lite 解码 Big5 编码
      const $ = cheerio.load(html);
      const trElements = $("tr");
      let dataArray = [];
      // console.log(
      //   "%c securitiesCompanyTransactionRecords",
      //   "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
      //   "trElements",
      //   trElements
      // );
      trElements.each((index, element) => {
        // 获取当前 <tr> 元素下的所有 <td> 元素
        const tdElements = $(element).find("td");
        if (tdElements.length === 10) {
          // 创建一个对象来存储 <td> 元素的文本内容
          const dataObject = {
            securitiesDealer: $(tdElements[0]).text().trim(),
            buyingIn: $(tdElements[1]).text().trim(),
            sellingOut: $(tdElements[2]).text().trim(),
            totalDifference:
              $(tdElements[1]).text().trim() - $(tdElements[2]).text().trim(), //$(tdElements[3]).text().trim(),
            percentage: $(tdElements[4]).text().trim(),
          };
          const dataObject2 = {
            securitiesDealer: $(tdElements[5]).text().trim(),
            buyingIn: $(tdElements[6]).text().trim(),
            sellingOut: $(tdElements[7]).text().trim(),
            totalDifference:
              $(tdElements[6]).text().trim() - $(tdElements[7]).text().trim(), //$(tdElements[8]).text().trim(),
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
      // dataArray.sort((a, b) => {
      //   const percentageA = parseFloat(a.percentage.replace("%", ""));
      //   const percentageB = parseFloat(b.percentage.replace("%", ""));
      //   return percentageB - percentageA;
      // });
      switch (req.query.displayMethod) {
        case "Overbuy":
          dataArray = dataArray.filter((item) => item.totalDifference > 0);
          break;
        case "OverSold":
          dataArray = dataArray.filter((item) => item.totalDifference < 0);
          break;
        default:
          break;
      }
      switch (req.query.sortBy) {
        case "ASC":
          dataArray.sort((a, b) => a.totalDifference - b.totalDifference);
          break;
        case "DESC":
          dataArray.sort((a, b) => b.totalDifference - a.totalDifference);
          break;
        default:
          break;
      }
      return dataArray;
    } catch (error) {
      console.log(
        "%c securitiesCompanyTransactionRecords",
        "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
        "error:",
        error
      );
      return error.message;
    }
  }

  async theLatestOpeningDate() {
    try {
      const responseClosingDates = await this.stockMarketOpeningAndClosingDates(
        false
      );
      const dates = responseClosingDates.map(
        (dateString) => new Date(dateString)
      );

      let currentTimeStamp = Date.now();
      let taiwanOffset = 8 * 60 * 60 * 1000;
      let taiwanTimeStamp = currentTimeStamp + taiwanOffset;
      let taiwanDate = new Date(taiwanTimeStamp);

      //   let currentDate = new Date();
      //   let options = { timeZone: 'Asia/Taipei', hour12: false };
      //   let taiwanDate = new Date(currentDate.toLocaleString('en-US', options));

      if (taiwanDate.getHours() >= 20) {
        taiwanDate.setDate(taiwanDate.getDate() - 1);
      }
      // Find the next valid trading date
      while (
        taiwanDate.getDay() === 6 || // Saturday
        taiwanDate.getDay() === 0 || // Sunday
        dates.some((date) => date.toDateString() === taiwanDate.toDateString()) // Closing date
      ) {
        taiwanDate.setDate(taiwanDate.getDate() - 1); // Decrement date
      }

      const _yyyyMMdd = taiwanDate.toISOString().slice(0, 10).replace(/-/g, ""); // 格式化为 yyyyMMdd
      return _yyyyMMdd;
    } catch (error) {
      return "Error：" + error.message;
    }
  }

  async stockMarketOpeningAndClosingDates(requestAllData = false) {
    try {
      const apiUrl =
        "https://www.twse.com.tw/rwd/zh/holidaySchedule/holidaySchedule?response=json&_=" +
        Date.now();

      // const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      // await wait(3000);

      const response = await axios.get(apiUrl);

      if (response.status === 200 && response.data.data.length > 0) {
        const responseBody = response.data;
        const originalResult = responseBody.data || [];
        if (requestAllData == false) {
          const dates = originalResult.map((item) => item[0]);
          return dates;
        } else {
          return responseBody;
        }
      } else {
        console.log(
          "%c stockMarketOpeningAndClosingDates",
          "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
          "req:",
          req
        );
      }
    } catch (error) {
      return `Error：${error.message}`;
    }
  }

  async getQuoteTimeSalesStore() {
    try {
      // 缺失的代码请自行补充
    } catch (error) {
      console.error("Error：", error.message);
      return "Error：" + error.message;
    }
  }
}

export default StocksService;
