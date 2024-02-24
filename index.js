import express from "express";
//const express=require('express');

import bodyParser from "body-parser";
import GetStocksService from "./Services/GetStocksService.js";
import HttpClientService from "./Services/HttpClientService.js";
import StockController from "./Controllers/StockController.js"

import swaggerUi from 'swagger-ui-express';
// import swaggerDocument from './swagger.json';

import swaggerDocument from './swagger.json' assert { type: 'json' };

const app = express();
const PORT = 9421;
const HOST = "0.0.0.0"; // This will make the server accessible externally


app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', StockController); // 使用新的路由

app.use(bodyParser.json());//Middlewares 解析傳入請求的 JSON 格式數據

app.listen(PORT, HOST, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
