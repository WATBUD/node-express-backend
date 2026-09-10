import express from "express";
import dotenv from 'dotenv';
//import bodyParser from "body-parser";
import swaggerUiExpress from 'swagger-ui-express';
import cors from 'cors';
import helmet from 'helmet';
import { expressjwt } from 'express-jwt';
import swaggerSpecs from './swagger-specs.js';
import requestLogger from './src/middlewares/request-logger.js';
import { globalLimiter } from './src/middlewares/security.js';
import { trackIniActivity } from './src/middlewares/ini-activity.js';
import HttpClientService from "./src/services/http-client-service.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Render 等反向代理後方需信任第一層代理，才能取得真實用戶 IP。
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || (process.env.NODE_ENV === 'production' ? 1 : 0));
if (trustProxyHops > 0) app.set('trust proxy', trustProxyHops);

// CORS 白名單：預設值 + 環境變數 CORS_ORIGINS（逗號分隔）擴充，
// 上線時在 Render 設定 CORS_ORIGINS 即可加入前端網址，不必改 code。
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'https://nextshadcn14.vercel.app',
  'https://watchlab-lovat.vercel.app',
];
const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
};

app.disable('x-powered-by');
// Swagger UI 需要行內樣式與腳本，因此保留其他安全標頭但不啟用預設 CSP。
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '32kb' }));
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));
app.use(globalLimiter);

// Google Play 與未登入使用者必須能公開查看政策及帳號刪除說明。
app.use('/ini/legal', express.static('public/ini/legal'));
app.get('/privacy-policy', (req, res) => res.redirect(302, '/ini/legal/privacy-policy.html'));
app.get('/delete-account', (req, res) => res.redirect(302, '/ini/legal/delete-account.html'));
app.get('/child-safety-standards', (req, res) => res.redirect(302, '/ini/legal/child-safety-standards.html'));





// Swagger documentation
swaggerSpecs.forEach(spec => {
  app.use(`${spec.info.routePath}`, swaggerUiExpress.serve, (...args) => swaggerUiExpress.setup(spec)(...args));
});

// 舊文件入口保留轉址，實際 API 路徑不受文件分組調整影響。
app.get(['/api/stock', '/api/user'], (req, res) => {
  res.redirect(301, '/api/watchlab/docs');
});

app.use(
  expressjwt({
    secret: process.env.JWT_SECRET,  // Make sure JWT_SECRET is set in your .env file
    algorithms: ['HS256'],
    requestProperty: 'user',
  }).unless({ path: [
  '/user-login',
  '/register',
  '/api/watchlab/user-login',
  '/api/watchlab/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verification/request',
  '/fake-api',
  '/',
  '/privacy-policy',
  '/delete-account',
  /^\/ini\/legal\/.*/,
  '/stock/ingest-daily-prices',   // protected by X-Cron-Secret instead of JWT
/^\/shared\/.*/] })  // Exclude routes from JWT verification
);

// Routes
app.use(['/api/auth', '/api/profiles', '/api/voice', '/api/chat', '/api/safety'], trackIniActivity);
import stockRoutes from './src/http/stock-routes.js';
//import stockHandler from './src/http/stock-handler.js';
//import stockRepository from './src/repositories/stock-repository.js';
//import StocksService from './src/services/stocks-service.js';

//const stockService = new StocksService();
app.use('/', stockRoutes());
app.use('/api/watchlab', stockRoutes());
/*------------------ */;

import userRoutes from './src/http/user-routes.js';
import userHandler from "./src/http/user-handler.js";
import userRepository, { iniUserRepository } from './src/repositories/user-repository.js';
import UserService from './src/services/user-service.js';

const userService = new UserService(userRepository);
const _userHandler = userHandler(userService);
app.use('/', userRoutes(_userHandler));
app.use('/api/watchlab', userRoutes(_userHandler));
/*------------------ */;
import authRoutes from './src/http/auth-routes.js';
import authHandler from './src/http/auth-handler.js';
import AuthService from './src/services/auth-service.js';

const authService = new AuthService(iniUserRepository);
app.use('/', authRoutes(authHandler(authService)));
/*------------------ */;
import voiceRoutes from './src/http/voice-routes.js';
import voiceHandler from './src/http/voice-handler.js';
import VoiceService from './src/services/voice-service.js';
import voiceRepository from './src/repositories/voice-repository.js';

const voiceService = new VoiceService(voiceRepository);
app.use('/api/voice', voiceRoutes(voiceHandler(voiceService)));
/*------------------ */;
import chatRoutes from './src/http/chat-routes.js';
import chatHandler from './src/http/chat-handler.js';
import ChatService from './src/services/chat-service.js';
import chatRepository from './src/repositories/chat-repository.js';

const chatService = new ChatService(chatRepository);
app.use('/api/chat', chatRoutes(chatHandler(chatService)));
/*------------------ */;
import safetyRoutes from './src/http/safety-routes.js';
import safetyHandler from './src/http/safety-handler.js';
import SafetyService from './src/services/safety-service.js';
import safetyRepository from './src/repositories/safety-repository.js';

app.use('/api/safety', safetyRoutes(safetyHandler(new SafetyService(safetyRepository))));
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
  if (err?.name === 'MulterError') {
      const code = err.code === 'LIMIT_FILE_SIZE' ? 'VOICE_FILE_TOO_LARGE' : 'INVALID_VOICE_FILE';
      return res.status(400).json({ success: false, error: { code, message: code } });
  }
  if (err.type === 'entity.too.large') {
      return res.status(413).json({ success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'The request payload is too large.' } });
  }
  if (err.name === 'UnauthorizedError') {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'UNAUTHORIZED' } });
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
