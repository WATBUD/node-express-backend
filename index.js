import express from "express";
import dotenv from 'dotenv';
dotenv.config();
//const express=require('express');
import bodyParser from "body-parser";
import StockController from "./Controllers/StockController.js"
import IOC_Container from "./IOC_Container.js"
import swaggerUiExpress from 'swagger-ui-express';
import SwaggerSpecs from './SwaggerSpecs.js';
import cors from 'cors';


const corsOptions = {
  origin: [
    'http://www.example.com',
    'http://localhost:8080',
    'http://localhost:3000',
    'https://nextshadcn14.vercel.app',
    
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
const PORT = process.env.PORT || 3000;

const HOST = "0.0.0.0"; // This will make the server accessible externally
// console.log('Swagger Spec 1:', SwaggerSpecs[0]);
// console.log('Swagger Spec 2:', SwaggerSpecs[1]);
app.use(express.json());// Express 4.16.0 Middlewares 解析傳入請求的 JSON 格式數據

app.use(cors(corsOptions));

//app.use(bodyParser.json());Old
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

SwaggerSpecs.forEach(spec=>{
  app.use(`${spec.info.routePath}`, swaggerUiExpress.serve, (...args) => swaggerUiExpress.setup(spec)(...args));
})   

app.use('/', StockController); 
//Dependency Injection (依賴注入)
app.use('/', IOC_Container.resolve("User_Controller"));
app.use('/', IOC_Container.resolve("SharedAPI_Controller"));


app.listen(PORT, HOST, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});


// console.log(
//   "%c PrismaServiceInstance",
//   "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
// );


