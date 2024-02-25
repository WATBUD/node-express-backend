// swagger.js

import swaggerJsdoc from 'swagger-jsdoc';

const options1 = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'stocks API',
      version: '1.0.0',
      description: 'APIs for managing stocks data',
      name:'stocks',
    },
  },
  apis: ['./Controllers/StockController.js'],

};
const options2 = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'users API',
      version: '1.0.0',
      description: 'APIs for managing users data',
      name:'users',
    },
  },
  apis: ['./Controllers/SharedAPI_Controller.js'],

};
const swaggerSpecs = [
  swaggerJsdoc(options1)
  //, swaggerJsdoc(options2)

];

export default swaggerSpecs;
