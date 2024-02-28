import axios from "axios";
import _ from "lodash";
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
class GetStocksService {
  //static httpClient = axios.create();
  constructor() {
    // 初始化 axios 实例
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
      const apiUrl =
        "  https://www.twse.com.tw/rwd/zh/fund/T86?date=20240227&selectType=ALL&response=json&_=1709119072350";
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        const responseData = response.data;
        return responseData;
      } else {
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


  static async getTheLatestOpeningDate() {
    try {
      const responseClosingDates =
        await this.getStockMarketOpeningAndClosingDates(false);
      const dates = responseClosingDates.map(
        (dateString) => new Date(dateString)
      ); // 转换为 Date 对象的数组

      let currentTimeStamp = Date.now();
      let taiwanOffset = 8 * 60 * 60 * 1000;
      let taiwanTimeStamp = currentTimeStamp + taiwanOffset;
      let taiwanDate = new Date(taiwanTimeStamp);

      //   let currentDate = new Date();
      //   let options = { timeZone: 'Asia/Taipei', hour12: false };
      //   let taiwanDate = new Date(currentDate.toLocaleString('en-US', options));

      if (taiwanDate.getHours() < 20) {
        taiwanDate.setDate(taiwanDate.getDate() - 1);
      }
      //循环递减日期，直到找到不是周六的日期
      while (
        taiwanDate.getDay() === 6 ||
        taiwanDate.getDay() === 0 ||
        dates.some((date) => date.toDateString() === taiwanDate.toDateString())
      ) {
        taiwanDate.setDate(taiwanDate.getDate() - 1);
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
