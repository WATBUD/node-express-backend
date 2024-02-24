// swaggerConfig.js

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description: 'A simple Express API with Swagger'
    }
  },
  apis: ['./routes/*.js'], // 替换为您的 API 文件路径
};

const specs = swaggerJsdoc(options);

export default specs;
