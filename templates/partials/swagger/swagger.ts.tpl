import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '__PROJECT_NAME__ API',
      version: '1.0.0',
      description: 'API documentation',
    },
    servers: [{ url: '/api' }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
