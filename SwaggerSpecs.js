import swaggerJsdoc from 'swagger-jsdoc';

const securitySchemes = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT', // 這個可以是你用的 token 的格式
  description: '請在下方提供 JWT 令牌',
};

const options1 = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stocks',
      version: '1.0.0',
      description: 'APIs come from crawlers and third parties. If you have any questions, please contact Louis.',
      routePath:'/api/stock'
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
  apis: ['./adapters/http/stock_routes.js'],
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
  apis: ['./adapters/http/share_api_routes.js'],
};

const options3 = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Users',
      version: '1.0.0',
      description: 'APIs for managing users data',
      routePath:'/api/user'
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
  apis: ['./adapters/http/user_routes.js'],
};

const SwaggerSpecs = [
  swaggerJsdoc(options1),
  swaggerJsdoc(options2),
  swaggerJsdoc(options3)
];

export default SwaggerSpecs;
