import axios from "axios";
import _ from "lodash";
import cheerio from "cheerio";
import iconv from 'iconv-lite';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
class GetStocksService {
  //static httpClient = axios.create();
  constructor() {
    //this.httpClient = axios.create();
  }

  static async getNordVPNDataAsync(ipAddress) {
    try {
      const apiUrl = `https://nordvpn.com/wp-admin/admin-ajax.php?action=get_user_info_data&ip=${ipAddress}`;
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error(`发生异常：${ipAddress}`, error.message);
      return `发生异常：${ipAddress}` + error.message;
    }
  }
  static async getLocalPublicIpAddressAsync() {
    try {
      const apiUrl = "https://api64.ipify.org?format=text";
      const response = await axios.get(apiUrl);

      if (response.status === 200) {
        return response.data;
      } else {
        return "Unable to retrieve public IP address";
      }
    } catch (error) {
      return "Error: " + error.message;
    }
  }

  static async getExDividendNoticeForm(limitDays, isCashDividend = false) {
    try {
      // 缺失的代码请自行补充
    } catch (error) {
      console.error("发生异常：", error.message);
      return "发生异常：" + error.message;
    }
  }

  static async getFiveLevelsOfStockInformation(stockCode) {
    try {
      const apiUrl = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${stockCode}.tw&json=1&delay=0&_=1701445552510`;

      const response = await axios.get(apiUrl);

      if (response.status === 200) {
        return response.data;
      } else {
        return `HTTP请求失败，状态码：${response.status}`;
      }
    } catch (error) {
      return `发生异常：${error.message}`;
    }
  }

  static async getDailyMarketTrading() {
    try {
      const apiUrl =
        "https://www.twse.com.tw/rwd/zh/afterTrading/FMTQIK?response=json&_=1709117440570";
      const response = await axios.get(apiUrl);
      if (response.status === 200 && response.data.data.length > 0) {
        const responseBody = response.data;
        return responseBody;
      } else {
        console.log(
          "%c getDailyMarketTrading",
          "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
          "req:",
          req
        );
      }
    } catch (error) {
      return `发生异常：${error.message}`;
    }
  }

  static async getDailyClosingQuote() {
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
          "%c getDailyClosingQuote",
          "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
          "req:",
          req
        );
      }
    } catch (error) {
      return `发生异常：${error.message}`;
    }
  }

  static async getTop20_SecuritiesByTradingVolume() {
    try {
      const latestOpeningDate = await this.getTheLatestOpeningDate();
      const apiUrl =
      `https://www.twse.com.tw/rwd/zh/fund/T86?date=${latestOpeningDate}&selectType=ALL&response=json`;
      const response = await axios.get(apiUrl);

      if (response.status == 200) {
        console.log(
          "%c getTop20_SecuritiesByTradingVolume",
          "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
          latestOpeningDate,response,
        );
        const _data = (response.data.data || []).slice(0, 20); 
        response.data.data=_data;
        return response.data;
      } 
    } catch (error) {
      return `发生异常：${error.message}`;
    }
  }

  static async getThreeMajorInstitutionalInvestors() {
    try {
      const latestOpeningDate = await this.getTheLatestOpeningDate();
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
      return `发生异常：${error.message}`;
    }
  }

  static async getSecuritiesCompanyTransactionRecords(req) {
    try {
      const stockNo = req.params.stockNo;
      console.log(
        "%c getSecuritiesCompanyTransactionRecords",
        "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
        'req.params',
        req.params,
        'req.query',
        req.query,
      );
      const url = `https://fubon-ebrokerdj.fbs.com.tw/z/zc/zco/zco.djhtm?a=${stockNo}&e=2024-2-19&f=2024-2-19`;
  
      const response = await axios.get(url, {
        responseType: "arraybuffer", // 将响应类型设置为 arraybuffer
      });
      const htmlBuffer = response.data;
      const html = iconv.decode(htmlBuffer, "big5"); // 使用 iconv-lite 解码 Big5 编码
      const $ = cheerio.load(html);
      const trElements = $("tr");
      const dataArray = [];
      // console.log(
      //   "%c getSecuritiesCompanyTransactionRecords",
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
      return error.message;
    }
  }

  static async getTheLatestOpeningDate() {
    try {
      const responseClosingDates =
        await this.getStockMarketOpeningAndClosingDates(false);
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
      return "发生异常：" + error.message;
    }
  }

  static async getStockMarketOpeningAndClosingDates(requestAllData = false) {
    try {
      const apiUrl =
        "https://www.twse.com.tw/rwd/zh/holidaySchedule/holidaySchedule?response=json&_=" +
        Date.now();

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
          "%c getStockMarketOpeningAndClosingDates",
          "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
          "req:",
          req
        );
      }
    } catch (error) {
      return `发生异常：${error.message}`;
    }
  }
  
  static async getQuoteTimeSalesStore() {
    try {
      // 缺失的代码请自行补充
    } catch (error) {
      console.error("发生异常：", error.message);
      return "发生异常：" + error.message;
    }
  }

}

export default GetStocksService;
