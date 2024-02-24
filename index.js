import express from "express";
//const express=require('express');

import bodyParser from "body-parser";
const app = express();
const PORT = 9421;
import GetStocksService from "./Services/GetStocksService.js";
import HttpClientService from "./Services/HttpClientService.js";
import StockController from "./Controllers/StockController.js"
const HOST = "0.0.0.0"; // This will make the server accessible externally

app.use('/', StockController); // 使用新的路由

app.use(bodyParser.json());

app.listen(PORT, HOST, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
