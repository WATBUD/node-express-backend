import express from "express";
import dotenv from 'dotenv';
//import bodyParser from "body-parser";
import swaggerUiExpress from 'swagger-ui-express';
import cors from 'cors';
import expressJwt from 'express-jwt';
import swaggerSpecs from './swagger-specs.js';
import requestLogger from './src/middlewares/request-logger.js';


import HttpClientService from "./src/services/http-client-service.js";


import stockRoutes from './src/http/stock-routes.js';
import newStockHandler from './src/http/stock-handler.js';
import stockRepository from './src/repositories/stock-repository.js';
import StocksService from './src/services/stocks-service.js';
const stockService = new StocksService(stockRepository);
const stockHandler = newStockHandler(stockService);


import userRoutes from './src/http/user-routes.js';
import newUserHandler from "./src/http/user-handler.js";
import UserService from './src/services/user-service.js';
import userRepository from './src/repositories/user-repository.js';

const userService = new UserService(userRepository);
const userHandler = newUserHandler(userService);


import newShardHandler from "./src/http/share-api-handler.js";
import shareApiRoutes from "./src/http/share-api-routes.js";
import SharedService from "./src/services/shared-service.js";
import sharedRepository from './src/repositories/shared-repository.js';

const sharedService = new SharedService(sharedRepository);
const sharedHandler = newShardHandler(sharedService, HttpClientService);







dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// CORS options
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

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger(sharedService));




// Swagger documentation
swaggerSpecs.forEach(spec => {
  app.use(`${spec.info.routePath}`, swaggerUiExpress.serve, (...args) => swaggerUiExpress.setup(spec)(...args));
});

app.use(
  expressJwt({
    secret: process.env.JWT_SECRET,  // Make sure JWT_SECRET is set in your .env file
    algorithms: ['HS256'],
  }).unless({ path: [
  '/user-login', 
  '/register',
  '/',
/^\/shared\/.*/] })  // Exclude routes from JWT verification
);

// Routes
app.use('/', stockRoutes(stockHandler));
app.use('/', userRoutes(userHandler));
app.use('/', shareApiRoutes(sharedHandler));

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
      res.status(401).json({
          error: {
              message: err.message,
              //stack: err.stack
          }
      });
  } else {
      res.status(500).json({
          error: {
              message: 'Internal server error',
              details: err.message,
          }
      });
  }
});



app.listen(PORT, HOST, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
