import express from "express";
//const express=require('express');
import bodyParser from "body-parser";
import multer from 'multer';


import StockController from "./Controllers/StockController.js"
import SharedAPI_Controller from "./Controllers/SharedAPI_Controller.js"
import User_Controller from "./Controllers/User_Controller.js"
import swaggerUiExpress from 'swagger-ui-express';
import SwaggerSpecs from './SwaggerSpecs.js';
const app = express();
const PORT = 9421;
const HOST = "0.0.0.0"; // This will make the server accessible externally
// console.log('Swagger Spec 1:', SwaggerSpecs[0]);
// console.log('Swagger Spec 2:', SwaggerSpecs[1]);
app.use(express.json());// Express 4.16.0 Middlewares 解析傳入請求的 JSON 格式數據
//app.use(bodyParser.json());Old
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

SwaggerSpecs.forEach(spec=>{
  app.use(`${spec.info.routePath}`, swaggerUiExpress.serve, (...args) => swaggerUiExpress.setup(spec)(...args));
})   
app.use('/', StockController); 
app.use('/', SharedAPI_Controller);
app.use('/', User_Controller); 


app.listen(PORT, HOST, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});


// console.log(
//   "%c prismaServiceInstance",
//   "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
// );


