import axios from "axios";
import cheerio from "cheerio";
import iconv from 'iconv-lite';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
import {getFirstDayOfMonth,getLastThreeMonthsDates as getLastMonthsDates,dateToYYYYMMDD,sleep} from './custom-util-service.js';
import ResponseDTO from '../http/api-response-dto.js';
import stockRepository from '../repositories/stock-repository.js';

// --- TWSE MI_INDEX ingestion helpers -------------------------------------
// Keep only ordinary stocks + ETFs (incl. leveraged/inverse like 00631L) and
// preferred shares: a 4-6 digit code with an optional single letter suffix.
// Warrants are already excluded by MI_INDEX type=ALLBUT0999.
const STOCK_CODE_RE = /^\d{4,6}[A-Z]?$/;

// TWSE numbers come as strings with commas; "--", "", "X" mean no value.
function parseDecimalStr(raw) {
  if (raw == null) return null;
  const s = String(raw).replace(/,/g, "").trim();
  if (s === "" || s === "--" || s === "X") return null;
  return Number.isFinite(Number(s)) ? s : null;
}
function parseBigIntOrNull(raw) {
  if (raw == null) return null;
  const s = String(raw).replace(/,/g, "").trim();
  if (!/^\d+$/.test(s)) return null;
  try { return BigInt(s); } catch { return null; }
}
// "YYYYMMDD" -> Date at UTC midnight (Prisma @db.Date stores the date part).
function yyyymmddToDate(s) {
  return new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
}

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
          const { id, user_id, ...rest } = stock;
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

      // 選擇每個 <tr> 元素
      $("tr").each((index, element) => {
        const $element = $(element);

        // 取得 href 屬性
        const href = $element.find("td.col01 a").attr("href");

        // 取得其他欄位的文字內容

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


  // Fetch one trading day's full market OHLC from TWSE MI_INDEX.
  // Returns { ok, date, rows }. ok=false for holidays / no-data days.
  async fetchDailyAllStocks(dateStr, retries = 3) {
    const url = `https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?date=${dateStr}&type=ALLBUT0999&response=json`;
    let lastErr;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data } = await axios.get(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        if (data.stat !== "OK" || !Array.isArray(data.tables)) {
          return { ok: false, date: dateStr, rows: [] }; // holiday / no session
        }
        const table = data.tables.find((t) => /每日收盤行情/.test(t.title || ""));
        if (!table || !Array.isArray(table.data)) {
          return { ok: false, date: dateStr, rows: [] };
        }
        // Locate columns by header name (order is not guaranteed stable).
        const fields = table.fields || [];
        const col = (name) => fields.findIndex((f) => f.includes(name));
        const iCode = col("證券代號"), iName = col("證券名稱"), iOpen = col("開盤價"),
          iHigh = col("最高價"), iLow = col("最低價"), iClose = col("收盤價"), iVol = col("成交股數");
        if (iCode < 0 || iClose < 0) {
          throw new Error("MI_INDEX table layout unexpected (missing 證券代號/收盤價)");
        }
        const tradeDate = yyyymmddToDate(dateStr);
        const rows = [];
        for (const r of table.data) {
          const code = String(r[iCode]).trim();
          if (!STOCK_CODE_RE.test(code)) continue;      // skip warrants/indices
          const close = parseDecimalStr(r[iClose]);
          if (close == null) continue;                  // skip suspended / no trade
          rows.push({
            stock_id: code,
            name: iName >= 0 ? String(r[iName]).trim() : null,
            trade_date: tradeDate,
            open: parseDecimalStr(r[iOpen]),
            high: parseDecimalStr(r[iHigh]),
            low: parseDecimalStr(r[iLow]),
            close,
            volume: parseBigIntOrNull(r[iVol]),
          });
        }
        return { ok: true, date: dateStr, rows };
      } catch (err) {
        lastErr = err;
        if (attempt < retries) await sleep(1500 * attempt); // linear backoff
      }
    }
    throw new Error(`fetchDailyAllStocks(${dateStr}) failed: ${lastErr?.message}`);
  }

  // Ingest a single trading day into daily_price (idempotent).
  async ingestDay(dateStr) {
    const { ok, rows } = await this.fetchDailyAllStocks(dateStr);
    if (!ok) return { date: dateStr, ok: false, fetched: 0, inserted: 0 };
    const { count } = await this.StockRepository.insertDailyPrices(rows);
    await this.StockRepository.upsertStocks(
      rows.map((r) => ({ stock_id: r.stock_id, name: r.name }))
    );
    return { date: dateStr, ok: true, fetched: rows.length, inserted: count };
  }

  // Backfill: walk calendar days backward from Taiwan "today", skipping
  // weekends and holidays (days MI_INDEX returns no data), until `days`
  // trading days are ingested or `maxLookback` calendar days are exhausted.
  async ingestBackfill({ days = 30, maxLookback = 90, delayMs = 1500 } = {}) {
    const taiwanNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const cursor = new Date(Date.UTC(taiwanNow.getUTCFullYear(), taiwanNow.getUTCMonth(), taiwanNow.getUTCDate()));
    const summary = [];
    let tradingDays = 0;
    for (let i = 0; i < maxLookback && tradingDays < days; i++) {
      const dow = cursor.getUTCDay();
      if (dow !== 0 && dow !== 6) { // skip Sat/Sun
        const dateStr = dateToYYYYMMDD(cursor);
        const res = await this.ingestDay(dateStr);
        if (res.ok) {
          tradingDays++;
          summary.push(res);
          console.log(`  ${dateStr}: fetched ${res.fetched}, inserted ${res.inserted} (day ${tradingDays}/${days})`);
        }
        await sleep(delayMs); // be polite to TWSE
      }
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return { tradingDays, days: summary };
  }

  // Find all stocks whose close on the (effective) anchor day is at or below
  // their Bollinger lower band = MA(period) - k * populationStdDev(period).
  // Uses raw (unadjusted) prices — ex-dividend days may yield false touches.
  async bollingerLowerBandTouch({ date, period = 20, k = 2 } = {}) {
    period = Number(period) || 20;
    k = Number(k) || 2;
    const anchor = date ? yyyymmddToDate(date) : await this.StockRepository.getLatestTradeDate();
    if (!anchor) {
      return ResponseDTO.errorResponse("尚無報價資料，請先執行 ingestion 回補。");
    }
    const { dates, rows } = await this.StockRepository.getPriceWindow(anchor, period);
    if (dates.length < period) {
      return ResponseDTO.errorResponse(
        `歷史交易日不足：目前 ${dates.length} 天，需 ${period} 天，請先回補更多資料。`
      );
    }
    const effectiveAnchor = dates[dates.length - 1];
    const anchorTime = effectiveAnchor.getTime();

    // Group closes by stock (rows already ordered by stock_id, trade_date asc).
    const byStock = new Map();
    for (const r of rows) {
      let g = byStock.get(r.stock_id);
      if (!g) { g = { name: r.name, closes: [] }; byStock.set(r.stock_id, g); }
      if (r.name) g.name = r.name;
      g.closes.push({ t: r.trade_date.getTime(), c: Number(r.close) });
    }

    const round2 = (n) => Math.round(n * 100) / 100;
    const items = [];
    let scanned = 0, skipped = 0;
    for (const [stock_id, g] of byStock) {
      // Require a full window AND that the stock traded on the anchor day.
      if (g.closes.length !== period || g.closes[g.closes.length - 1].t !== anchorTime) {
        skipped++;
        continue;
      }
      scanned++;
      const closes = g.closes.map((x) => x.c);
      const mean = closes.reduce((a, b) => a + b, 0) / period;
      const variance = closes.reduce((a, b) => a + (b - mean) ** 2, 0) / period; // population σ
      const sd = Math.sqrt(variance);
      const lower = mean - k * sd;
      const close = closes[period - 1];
      if (close <= lower + 1e-9) {
        items.push({
          stock_id,
          name: g.name,
          close: round2(close),
          ma: round2(mean),
          lower_band: round2(lower),
          distance_pct: Number((((close - lower) / lower) * 100).toFixed(3)),
        });
      }
    }
    items.sort((a, b) => a.distance_pct - b.distance_pct);

    const fmt = (d) =>
      `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
    return ResponseDTO.successResponse(undefined, {
      trade_date: fmt(effectiveAnchor),
      period, k, scanned, skipped, matched: items.length, items,
    });
  }

  // Ingest just the latest trading day (for the daily cron).
  async ingestLatestDay() {
    const dateStr = await this.theLatestOpeningDate();
    if (/^Error/.test(dateStr)) throw new Error(dateStr);
    return await this.ingestDay(dateStr);
  }

  async fiveLevelsOfStockInformation(stockCode) {
    try {
      const apiUrl = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${stockCode}.tw&json=1&delay=0&_=1701445552510`;

      const response = await axios.get(apiUrl);

      if (response.status === 200) {
        return response.data;
      } else {
        return `HTTP 請求失敗，狀態碼：${response.status}`;
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
      const closingPrices = rawData.map((entry) => parseFloat(entry[6])); // 取得收盤價並轉換為浮點數

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
        return `HTTP 請求失敗，狀態碼：${response.status}`;
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
        responseType: "arraybuffer", // 將回應類型設定為 arraybuffer
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
        // 取得目前 <tr> 元素下的所有 <td> 元素
        const tdElements = $(element).find("td");
        if (tdElements.length === 10) {
          // 建立物件儲存 <td> 元素的文字內容
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

      const _yyyyMMdd = taiwanDate.toISOString().slice(0, 10).replace(/-/g, ""); // 格式化為 yyyyMMdd
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
      // 缺少的程式碼請自行補充
    } catch (error) {
      console.error("Error：", error.message);
      return "Error：" + error.message;
    }
  }
}

export default StocksService;
