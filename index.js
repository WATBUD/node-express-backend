import express from "express";
import dotenv from 'dotenv';
//import bodyParser from "body-parser";
import swaggerUiExpress from 'swagger-ui-express';
import cors from 'cors';
import expressJwt from 'express-jwt';
import SwaggerSpecs from './SwaggerSpecs.js';
import userRouter from './adapters/http/user_routes.js';
import stockRouter from './adapters/http/stock_routes.js';
import share_api_routes from './adapters/http/share_api_routes.js';

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
SwaggerSpecs.forEach(spec => {
  app.use(`${spec.info.routePath}`, swaggerUiExpress.serve, (...args) => swaggerUiExpress.setup(spec)(...args));
});

app.use(
  expressJwt({
    secret: process.env.JWT_SECRET,  // Make sure JWT_SECRET is set in your .env file
    algorithms: ['HS256'],
  }).unless({ path: ['/user-login', 
  '/register','/'] })  // Exclude routes from JWT verification
);

// Routes
app.use('/', stockRouter);
app.use('/', userRouter);
app.use('/', share_api_routes);

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
      // 如果是 JWT 错误，返回 JSON 格式的错误信息
      res.status(401).json({
          error: {
              message: 'No authorization token was found',
              details: err.message,
              //stack: err.stack
          }
      });
  } else {
      // 其他错误处理
      res.status(500).json({
          error: {
              message: 'Internal server error',
              details: err.message,
              //stack: err.stack
          }
      });
  }
});


app.listen(PORT, HOST, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
