import express from "express";
//const express=require('express');
import bodyParser from "body-parser";
import StockController from "./Controllers/StockController.js"
import SharedAPI_Controller from "./Controllers/SharedAPI_Controller.js"

import User_Controller from "./Controllers/User_Controller.js"

import swaggerUiExpress from 'swagger-ui-express';
import swaggerSpecs from './swaggerSpecs.js';

import prismaServiceInstance from './Database/prisma/prismaService.js';

// import swaggerDocument from './swagger.json' assert { type: 'json' };
const app = express();
const PORT = 9421;
const HOST = "0.0.0.0"; // This will make the server accessible externally
// console.log('Swagger Spec 1:', swaggerSpecs[0]);
// console.log('Swagger Spec 2:', swaggerSpecs[1]);
app.use(express.json());

swaggerSpecs.forEach(spec=>{
  app.use(`${spec.info.routePath}`, swaggerUiExpress.serve, (...args) => swaggerUiExpress.setup(spec)(...args));
})   
app.use('/', StockController); 
app.use('/', SharedAPI_Controller);
app.use('/', User_Controller); 

app.use(bodyParser.json());//Middlewares 解析傳入請求的 JSON 格式數據

app.listen(PORT, HOST, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});


console.log(
  "%c prismaServiceInstance",
  "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
);


