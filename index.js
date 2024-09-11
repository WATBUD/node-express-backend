import express from "express";
import dotenv from 'dotenv';
//import bodyParser from "body-parser";
import swaggerUiExpress from 'swagger-ui-express';
import cors from 'cors';
import expressJwt from 'express-jwt';
import swaggerSpecs from './swagger-specs.js';
import requestLogger from './adapters/middlewares/requestLogger.js';



import HttpClientService from "./core/application/http_client_service.js";
import StockRouter from './adapters/http/stock_routes.js';



import newUserHandler from "./adapters/http/user_handler.js";
import userRoutes from './adapters/http/user_routes.js';
import UserService from './core/application/user_service.js';
import userRepository from './adapters/repository/UserRepository.js';


import newShardHandler from "./adapters/http/share_api_handler.js";
import shareApiRoutes from "./adapters/http/share_api_routes.js";
import SharedService from "./core/application/shared_service.js";
import sharedRepository from './adapters/repository/SharedRepository.js';



const userService = new UserService(userRepository);
const userHandler = newUserHandler(userService);


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
app.use('/', StockRouter);
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
      // 其他错误处理
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
