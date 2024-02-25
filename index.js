import express from "express";
//const express=require('express');

import bodyParser from "body-parser";
import GetStocksService from "./Services/GetStocksService.js";
import HttpClientService from "./Services/HttpClientService.js";
import StockController from "./Controllers/StockController.js"
import SharedAPI_Controller from "./Controllers/SharedAPI_Controller.js"
import swaggerUiExpress from 'swagger-ui-express';
import swaggerSpecs from './swaggerSpecs.js';

// import swaggerDocument from './swagger.json' assert { type: 'json' };
const app = express();
const PORT = 9421;
const HOST = "0.0.0.0"; // This will make the server accessible externally
const swaggerSpec = {
  "openapi": "3.0.0",
  "info": {
    "title": "Sample API",
    "version": "1.0.0",
    "description": "This is a sample API for demonstration purposes."
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "Get all users",
        "description": "Returns a list of all users.",
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "integer" },
                      "name": { "type": "string" },
                      "email": { "type": "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
app.use(express.json());
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log('Swagger Spec 1:', swaggerSpecs[0]);
console.log('Swagger Spec 2:', swaggerSpecs[1]);

// app.use(`/api-docs/stocks`, swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpecs[0]));
// app.use(`/api-docs/users`, swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpecs[1]));


// app.use(`/api-docs/333`, swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));



swaggerSpecs.forEach((swaggerSpec, index) => {
  app.use(`/api-docs/${swaggerSpec.info.name}`, swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));
});

app.use('/', StockController); // 使用新的路由
app.use('/', SharedAPI_Controller); // 使用新的路由


app.use(bodyParser.json());//Middlewares 解析傳入請求的 JSON 格式數據

app.listen(PORT, HOST, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
