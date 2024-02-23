import axios from "axios";
import _ from "lodash";

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

  static async getThreeMajorInstitutionalInvestors() {
    try {
      const latestOpeningDate = await this.getTheLatestOpeningDate(); // 假设实现了这个函数来获取最新的开放日期

      const apiUrl = `https://wwwc.twse.com.tw/rwd/zh/fund/T86?date=${latestOpeningDate}&selectType=ALL&response=json&_=1704631325883`;

      const response = await axios.get(apiUrl);

      if (response.status === 200) {
        const data = response.data.data || []; // 获取数据
        if (data.length > 0) {
          const sortedResult = _.orderBy(
            data,
            [(item) => parseInt(item[5].replace(/,/g, ""))],
            ["desc"]
          ); // 根据第六列排序（假设是数值类型的字符串）
          const top100Items = _.take(sortedResult, 10); // 取前10项
          return JSON.stringify(top100Items); // 返回 JSON 字符串
        } else {
          return "HTTP请求失败，状态码：200，但未能获取有效数据"; // 数据为空的情况
        }
      } else {
        return `HTTP请求失败，状态码：${response.status}`;
      }
    } catch (error) {
      return `发生异常：${error.message}`;
    }
  }

  //日收盤價及月平均收盤價
  static async getTheLatestOpeningDate() {
    try {
      const responseClosingDates = await this.getStockMarketOpeningAndClosingDates(
        false
      );
      const dates = responseClosingDates.map(
        (dateString) => new Date(dateString)
      ); // 转换为 Date 对象的数组

      let currentDate = new Date();
      if (currentDate.getHours() < 20) {
        currentDate.setDate(currentDate.getDate() - 1);
      }

      // 循环递减日期，直到找到不是周六的日期
      while (
        currentDate.getDay() === 6 ||
        currentDate.getDay() === 0 ||
        dates.some((date) => date.toDateString() === currentDate.toDateString())
      ) {
        currentDate.setDate(currentDate.getDate() - 1);
      }

      const _yyyyMMdd = currentDate
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, ""); // 格式化为 yyyyMMdd
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

      if (response.status === 200) {
        const responseBody = response.data;
        const originalResult = responseBody.data || [];

        if (originalResult.length > 0 && !requestAllData) {
          const dates = originalResult.map((item) => item[0]);
          const jsonResult = JSON.stringify(dates);
          return jsonResult;
        } else {
          const jsonResult = JSON.stringify(responseBody);
          return jsonResult;
        }
      } else {
        return null; // 或者返回错误信息，取决于你的需求
      }
    } catch (error) {
      return null; // 或者返回错误信息，取决于你的需求
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

  static async fetchAndParseJson(
    url = "https://tw.stock.yahoo.com/quote/3231.TW/time-sales"
  ) {
    try {
      // 缺失的代码请自行补充
    } catch (error) {
      console.error("发生异常：", error.message);
      return "发生异常：" + error.message;
    }
  }
}

export default GetStocksService;
