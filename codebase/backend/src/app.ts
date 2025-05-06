import express, { Application } from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import accountsRouter from './api/routes/accountsRoutes';
import paymentsRouter from './api/routes/paymentsRoutes';

export const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Energy Accounts API',
      version: '1.0.0',
      description: 'API for managing energy accounts and payments'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Account: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['ELECTRICITY', 'GAS'] },
            address: { type: 'string' },
            meterNumber: { type: 'string' },
            volume: { type: 'number' },
            balance: { type: 'number' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            accountId: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date-time' },
            cardDetails: {
              type: 'object',
              properties: {
                cardNumber: { type: 'string' },
                cardholderName: { type: 'string' }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/api/controllers/*.ts']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
// Fix TypeScript error by using type assertions through unknown
app.use('/api-docs', swaggerUi.serve as unknown as express.RequestHandler);
app.use('/api-docs', swaggerUi.setup(swaggerDocs) as unknown as express.RequestHandler);

// Routes
app.use('/api/accounts', accountsRouter);
app.use('/api/payments', paymentsRouter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;