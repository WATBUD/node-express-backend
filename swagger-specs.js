import swaggerJsdoc from 'swagger-jsdoc';

const securitySchemes = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT', // 這個可以是你用的 token 的格式
  description: '請在下方提供 JWT 令牌',
};

const watchlabOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WatchLab API',
      version: '1.0.0',
      description: 'WatchLab 專用後端 API 文件，包含帳號、使用者資料、股票清單、追蹤清單與行情功能。',
      routePath: '/api/watchlab/docs',
    },
    servers: [{ url: '/api/watchlab', description: 'WatchLab API' }],
    components: {
      securitySchemes: {
        bearerAuth: securitySchemes,
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: [
    './src/http/stock-routes.js',
    './src/http/user-routes.js',
  ],
};

const options2 = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shared',
      version: '1.0.0',
      description: 'APIs for managing share data',
      routePath:'/api/share'
    },
    components: {
      securitySchemes: {
        bearerAuth: securitySchemes,
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/http/share-api-routes.js'],
};

const iniDatingOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'INI Dating API',
      version: '1.0.0',
      description: 'INI Dating 專用後端 API 文件。目前包含 Email 驗證碼、帳號註冊、登入及目前使用者資料。',
      routePath: '/api/ini-dating',
    },
    components: {
      securitySchemes: {
        bearerAuth: securitySchemes,
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: { type: 'string', example: 'INVALID_CREDENTIALS' },
                message: { type: 'string', example: 'The account or password is incorrect.' },
              },
            },
          },
        },
        AuthSession: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT 存取權杖' },
            user: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  },
  apis: ['./src/http/auth-routes.js'],
};

const SwaggerSpecs = [
  swaggerJsdoc(watchlabOptions),
  swaggerJsdoc(options2),
  swaggerJsdoc(iniDatingOptions)
];

export default SwaggerSpecs;
