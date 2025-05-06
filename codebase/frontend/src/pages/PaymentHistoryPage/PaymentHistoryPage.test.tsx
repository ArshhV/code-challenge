import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'; // Removed act
import '@testing-library/jest-dom';
import PaymentHistoryPage from './PaymentHistoryPage'; // Added missing import
import { api } from '../../services/api';
import { Payment } from '../../types';

// Mock the API module
jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('PaymentHistoryPage', () => {
  const mockPayments: Payment[] = [
    {
      id: 'P-0001',
      accountId: 'A-0001',
      amount: 120.50,
      date: '2025-04-15T14:30:00Z',
      method: 'CARD',
      status: 'COMPLETED',
      reference: 'REF123456',
      cardDetails: {
        cardNumber: '**** **** **** 1234',
        cardholderName: 'John Doe'
      }
    },
    {
      id: 'P-0002',
      accountId: 'A-0004',
      amount: 85.20,
      date: '2025-04-10T09:15:00Z',
      method: 'BANK_TRANSFER',
      status: 'PENDING',
      reference: 'REF654321'
    },
    {
      id: 'P-0003',
      accountId: 'A-0001',
      amount: 50.00,
      date: '2025-04-05T16:45:00Z',
      method: 'DIRECT_DEBIT',
      status: 'FAILED',
      reference: 'REF789012'
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the API responses
    mockedApi.getPaymentHistory.mockImplementation((accountId: string) => {
      // Simulate a slight delay in API response
      return new Promise(resolve => setTimeout(() => {
        resolve(mockPayments.filter(payment => payment.accountId === accountId));
      }, 50));
    });
  });

  test('renders loading state initially', () => {
    render(<PaymentHistoryPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders payment history after loading', async () => {
    render(<PaymentHistoryPage />);
    // Wait for a specific piece of data that appears after loading.
    expect(await screen.findByText('P-0001')).toBeInTheDocument(); // P-0001 is from account A-0001
        
    // Check if page title is rendered
    expect(screen.getByText('Payment History')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: /payment history table/i });
    const tableHeaders = within(table).getAllByRole('columnheader');
    expect(tableHeaders[0]).toHaveTextContent('Date');
    expect(tableHeaders[1]).toHaveTextContent('Account ID');
    expect(tableHeaders[2]).toHaveTextContent('Payment ID');
    expect(tableHeaders[3]).toHaveTextContent('Amount');
    expect(tableHeaders[4]).toHaveTextContent('Reference');
    expect(tableHeaders[5]).toHaveTextContent('Status');
    expect(tableHeaders[6]).toHaveTextContent('Card Details');
    
    const rows = within(table).getAllByRole('row');
    const firstDataRow = rows[1]; // Assuming P-0001 is sorted to be among the first if multiple calls resolve
    
    expect(within(firstDataRow).getByText('A-0001')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('$120.50')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('REF123456')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('COMPLETED')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('**** **** **** 1234')).toBeInTheDocument();
    
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    // Check API calls after data is loaded and assertions pass
    await waitFor(() => { // Wait for all async calls to settle if necessary
        expect(mockedApi.getPaymentHistory).toHaveBeenCalledWith('A-0001');
        expect(mockedApi.getPaymentHistory).toHaveBeenCalledWith('A-0004');
        expect(mockedApi.getPaymentHistory).toHaveBeenCalledWith('A-0008');
        expect(mockedApi.getPaymentHistory).toHaveBeenCalledTimes(3); // Ensure it's called for all expected accounts
    });
  });

  test('searches payments by account ID', async () => {
    render(<PaymentHistoryPage />);
    await screen.findByText('P-0001'); // Wait for initial load
        
    fireEvent.change(screen.getByLabelText('Search by Account ID, Payment ID or Reference'), { 
      target: { value: 'A-0004' } 
    });
    
    // Wait for the table to update with filtered results for A-0004, which has P-0002
    expect(await screen.findByText('P-0002')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: /payment history table/i });
    // Use waitFor for assertions on content that updates due to filter
    await waitFor(() => {
      const rows = within(table).getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row for P-0002
      const dataRow = rows[1];
      expect(within(dataRow).getByText('A-0004')).toBeInTheDocument();
    });
  });

  test('searches payments by payment ID', async () => {
    render(<PaymentHistoryPage />);
    await screen.findByText('P-0001'); // Wait for initial load
        
    fireEvent.change(screen.getByLabelText('Search by Account ID, Payment ID or Reference'), { 
      target: { value: 'P-0003' } 
    });
    
    expect(await screen.findByText('P-0003')).toBeInTheDocument(); // Main assertion for the search
    const table = screen.getByRole('table', { name: /payment history table/i });
    await waitFor(() => {
      const rows = within(table).getAllByRole('row');
      expect(rows.length).toBe(2);
    });
  });

  test('searches payments by reference', async () => {
    render(<PaymentHistoryPage />);
    await screen.findByText('P-0001'); // Wait for initial load
        
    fireEvent.change(screen.getByLabelText('Search by Account ID, Payment ID or Reference'), { 
      target: { value: 'REF654321' } // Belongs to P-0002
    });
    
    expect(await screen.findByText('REF654321')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: /payment history table/i });
    await waitFor(() => {
      const rows = within(table).getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row for P-0002
      expect(within(rows[1]).getByText('P-0002')).toBeInTheDocument();
    });
  });

  test('displays error message when API call fails', async () => {
    // Mock API failure for all account calls
    mockedApi.getPaymentHistory.mockRejectedValue(new Error('API Error'));
    
    // Suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {}); // Mock to do nothing

    render(<PaymentHistoryPage />);
    expect(await screen.findByText('Failed to fetch payment history. Please try again later.')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test('displays message when no payments match filter', async () => {
    render(<PaymentHistoryPage />);
    await screen.findByText('P-0001'); // Wait for initial load
        
    fireEvent.change(screen.getByLabelText('Search by Account ID, Payment ID or Reference'), { 
      target: { value: 'NOT_EXISTS' } 
    });
    
    expect(await screen.findByText('No payment records found')).toBeInTheDocument();
  });
});