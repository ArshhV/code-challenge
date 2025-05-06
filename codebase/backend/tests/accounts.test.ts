import request from 'supertest';
import app from '../src/app';
import * as accountService from '../src/services/accountService';

// Mock the account service
jest.mock('../src/services/accountService');

describe('Accounts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all accounts with calculated balances', async () => {
    // Mock data
    const mockAccounts = [
      {
        id: 'A-0001',
        type: 'ELECTRICITY',
        address: '1 Test St',
        meterNumber: '123456',
        balance: 30
      },
      {
        id: 'A-0002',
        type: 'GAS',
        address: '2 Test Ave',
        volume: 1000,
        balance: -20
      }
    ];

    // Mock the service function
    (accountService.getAccountsWithBalances as jest.Mock).mockResolvedValue(mockAccounts);

    // Make the API request
    const response = await request(app).get('/api/accounts');
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAccounts);
    expect(accountService.getAccountsWithBalances).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when fetching accounts', async () => {
    // Mock a service error
    (accountService.getAccountsWithBalances as jest.Mock).mockRejectedValue(
      new Error('Service error')
    );

    // Make the API request
    const response = await request(app).get('/api/accounts');
    
    // Assertions
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Failed to fetch accounts');
  });
});