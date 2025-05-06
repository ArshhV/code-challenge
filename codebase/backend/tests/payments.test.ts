import request from 'supertest';
import app from '../src/app';
import * as paymentService from '../src/services/paymentService';

// Mock the payment service
jest.mock('../src/services/paymentService');

describe('Payments API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payments', () => {
    it('should process a payment successfully', async () => {
      // Mock payment data
      const paymentData = {
        accountId: 'A-0001',
        amount: 30,
        cardDetails: {
          cardNumber: '4111111111111111',
          cardholderName: 'Test User',
          expiryDate: '12/25',
          cvv: '123'
        }
      };

      // Mock response from service
      const mockPaymentResponse = {
        id: 'payment_123',
        accountId: 'A-0001',
        amount: 30,
        date: '2025-05-06T10:00:00.000Z',
        cardDetails: {
          cardNumber: 'xxxx-xxxx-xxxx-1111',
          cardholderName: 'Test User'
        }
      };

      // Set up mock
      (paymentService.processPayment as jest.Mock).mockResolvedValue(mockPaymentResponse);

      // Make the API request
      const response = await request(app)
        .post('/api/payments')
        .send(paymentData);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPaymentResponse);
      expect(paymentService.processPayment).toHaveBeenCalledWith(
        paymentData.accountId,
        paymentData.amount,
        paymentData.cardDetails
      );
    });

    it('should return 400 for missing required fields', async () => {
      // Incomplete payment data
      const incompleteData = {
        accountId: 'A-0001'
        // Missing amount and cardDetails
      };

      // Make the API request
      const response = await request(app)
        .post('/api/payments')
        .send(incompleteData);
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(paymentService.processPayment).not.toHaveBeenCalled();
    });

    it('should handle validation errors from payment service', async () => {
      // Mock payment data
      const paymentData = {
        accountId: 'A-0001',
        amount: 30,
        cardDetails: {
          cardNumber: '123', // Invalid card number
          cardholderName: 'Test User',
          expiryDate: '12/25',
          cvv: '123'
        }
      };

      // Mock service error
      const mockError = new Error('Invalid card number');
      (paymentService.processPayment as jest.Mock).mockRejectedValue(mockError);

      // Make the API request
      const response = await request(app)
        .post('/api/payments')
        .send(paymentData);
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid card number');
    });
  });

  describe('GET /api/payments', () => {
    it('should return payment history', async () => {
      // Mock payment history
      const mockPayments = [
        {
          id: 'payment_123',
          accountId: 'A-0001',
          amount: 30,
          date: '2025-05-06T10:00:00.000Z',
          cardDetails: {
            cardNumber: 'xxxx-xxxx-xxxx-1111',
            cardholderName: 'Test User'
          }
        },
        {
          id: 'payment_456',
          accountId: 'A-0002',
          amount: 50,
          date: '2025-05-05T09:00:00.000Z',
          cardDetails: {
            cardNumber: 'xxxx-xxxx-xxxx-2222',
            cardholderName: 'Another User'
          }
        }
      ];

      // Set up mock
      (paymentService.getPaymentHistory as jest.Mock).mockResolvedValue(mockPayments);

      // Make the API request
      const response = await request(app).get('/api/payments');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPayments);
      expect(paymentService.getPaymentHistory).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when fetching payment history', async () => {
      // Mock service error
      (paymentService.getPaymentHistory as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      // Make the API request
      const response = await request(app).get('/api/payments');
      
      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch payments');
    });
  });
});