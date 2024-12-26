import express from "express";
import dotenv from 'dotenv';
//import bodyParser from "body-parser";
import swaggerUiExpress from 'swagger-ui-express';
import cors from 'cors';
import expressJwt from 'express-jwt';
import swaggerSpecs from './swagger-specs.js';
import requestLogger from './src/middlewares/request-logger.js';
import HttpClientService from "./src/services/http-client-service.js";
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
  '/fake-api',
  '/',
/^\/shared\/.*/] })  // Exclude routes from JWT verification
);

// Routes
import stockRoutes from './src/http/stock-routes.js';
import stockHandler from './src/http/stock-handler.js';
import stockRepository from './src/repositories/stock-repository.js';
import StocksService from './src/services/stocks-service.js';

const stockService = new StocksService(stockRepository);
app.use('/', stockRoutes(stockHandler(stockService)));
/*------------------ */;

import userRoutes from './src/http/user-routes.js';
import userHandler from "./src/http/user-handler.js";
import userRepository from './src/repositories/user-repository.js';
import UserService from './src/services/user-service.js';

const userService = new UserService(userRepository);
const _userHandler = userHandler(userService);
app.use('/', userRoutes(_userHandler));
/*------------------ */;
import shardApiHandler from "./src/http/share-api-handler.js";
import shareApiRoutes from "./src/http/share-api-routes.js";
import sharedRepository from './src/repositories/shared-repository.js';
import SharedService from "./src/services/shared-service.js";

const sharedService = new SharedService(sharedRepository);
const _sharedHandler = shardApiHandler(sharedService, HttpClientService);
app.use('/', shareApiRoutes(_sharedHandler));
app.use(requestLogger(sharedService));

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
      res.status(401).send('');
      // res.status(401).json({
      //     error: {
      //         message: err.message,
      //         //stack: err.stack
      //     }
      // });
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
