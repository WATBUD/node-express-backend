import express from "express";
import bodyParser from "body-parser";
//const express=require('express');
const app = express();
const PORT = 9421;
import GetStocksService from "./Services/GetStocksService.js";
import HttpClientService from "./Services/HttpClientService.js";
const HOST = "0.0.0.0"; // This will make the server accessible externally

// 定义允许访问的 IP 地址列表
const allowedIPs = [];
// 中间件函数用于检查请求的 IP 地址是否在允许的列表中
const restrictAccess = (req, res, next) => {
  const clientIP = req.ip; // 获取请求的 IP 地址
  if (allowedIPs.includes(clientIP)) {
    // 如果请求的 IP 地址在允许的列表中，继续处理请求
    next();
  } else {
    // 如果请求的 IP 地址不在允许的列表中，返回 403 禁止访问错误
    res.status(403).send("Access Forbidden");
  }
};

// // 将中间件函数应用于所有请求
// app.use(restrictAccess);

app.use(bodyParser.json());
app.listen(PORT, HOST, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

app.get("/getThreeMajorInstitutionalInvestors", async (req, res) => {
  try {
    const data = await GetStocksService.getThreeMajorInstitutionalInvestors(); 
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/getTheLatestOpeningDate", async (req, res) => {
    try {
      const data = await GetStocksService.getTheLatestOpeningDate();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
app.get("/getStockMarketOpeningAndClosingDates", async (req, res) => {
    try {
      const data = await GetStocksService.getStockMarketOpeningAndClosingDates(); 
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

  


app.get("/getFiveLevelsOfStockInformation/:stockNo", async (req, res) => {
    try {
      const stockNo = req.params.stockNo;
      const data = await GetStocksService.getFiveLevelsOfStockInformation(stockNo);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.get("/GetClientIP", async (req, res) => {
  try {
    var ipAddress = req.ip;
    if (ipAddress == "::1" || "127.0.0.1") {
      const myip = await HttpClientService.getLocalPublicIpAddressAsync();
      ipAddress = myip;
    }
    const data = await HttpClientService.getNordVPNDataAsync(ipAddress);
    res.json(data);
    //res.send(ipAddress);
    console.log(
      "%c GetClientIP",
      "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
      "req:",
      req
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  console.log(`[TEST]`);
  res.send("form app.get('/' message");
});
