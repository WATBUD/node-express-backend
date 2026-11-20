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
      description: 'INI Dating 專用後端 API 文件，包含 Email 驗證、帳號、個人檔案與語音邀請。',
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
            accessToken: { type: 'string', description: 'JWT 存取權杖' },
            user: { type: 'object', additionalProperties: true },
          },
        },
        VoiceInvite: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            durationMs: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            audioPath: { type: 'string' },
            user: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  },
  apis: ['./src/http/auth-routes.js', './src/http/voice-routes.js', './src/http/chat-routes.js'],
};

const survivalEquationOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Survival Equation API',
      version: '1.0.0',
      description: 'Survival Equation（生存方程）遊戲專用帳號 API。使用獨立 Database（survival_equation），權杖 audience 為 survival-equation，不可用於其他服務。',
      routePath: '/api/survival-equation/docs',
    },
    servers: [{ url: '/api/survival-equation', description: 'Survival Equation API' }],
    components: {
      securitySchemes: { bearerAuth: securitySchemes },
      schemas: {
        SurvivalAuthSession: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string', description: 'JWT（audience: survival-equation，7 天有效）' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    account: { type: 'string', example: 'survivor_01' },
                    nickname: { type: 'string', example: '漂流者' },
                    createdAt: { type: 'string', format: 'date-time' },
                    lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/http/survival-auth-routes.js'],
};

const SwaggerSpecs = [
  swaggerJsdoc(watchlabOptions),
  swaggerJsdoc(options2),
  swaggerJsdoc(iniDatingOptions),
  swaggerJsdoc(survivalEquationOptions)
];

export default SwaggerSpecs;
