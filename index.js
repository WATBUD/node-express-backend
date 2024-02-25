import express from "express";
//const express=require('express');
import bodyParser from "body-parser";
import StockController from "./Controllers/StockController.js"
import SharedAPI_Controller from "./Controllers/SharedAPI_Controller.js"
import swaggerUiExpress from 'swagger-ui-express';
import swaggerSpecs from './swaggerSpecs.js';

// import swaggerDocument from './swagger.json' assert { type: 'json' };
const app = express();
const PORT = 9421;
const HOST = "0.0.0.0"; // This will make the server accessible externally
console.log('Swagger Spec 1:', swaggerSpecs[0]);
console.log('Swagger Spec 2:', swaggerSpecs[1]);
app.use(express.json());

app.use("/api-docs/stocks", swaggerUiExpress.serve, (...args) => swaggerUiExpress.setup(swaggerSpecs[0])(...args));
app.use("/api-docs/users", swaggerUiExpress.serve, (...args) => swaggerUiExpress.setup(swaggerSpecs[1])(...args));
app.use('/', StockController); // 使用新的路由
app.use('/', SharedAPI_Controller); // 使用新的路由

app.use(bodyParser.json());//Middlewares 解析傳入請求的 JSON 格式數據

app.listen(PORT, HOST, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
