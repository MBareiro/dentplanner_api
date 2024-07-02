const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Auth API',
      version: '1.0.0',
      description: 'API for managing authentication',
    },
    basePath: '/api',
  },
  apis: ['./routes/*.js'], // Rutas donde se encuentran las definiciones de Swagger
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
