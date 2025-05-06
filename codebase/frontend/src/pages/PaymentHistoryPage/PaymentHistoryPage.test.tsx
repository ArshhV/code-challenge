import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentHistoryPage from './PaymentHistoryPage';
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
      return Promise.resolve(mockPayments.filter(payment => payment.accountId === accountId));
    });
  });

  test('renders loading state initially', () => {
    render(<PaymentHistoryPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders payment history after loading', async () => {
    render(<PaymentHistoryPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if page title is rendered
    expect(screen.getByText('Payment History')).toBeInTheDocument();
    
    // Check if table headers are rendered
    const table = screen.getByRole('table', { name: /payment history table/i });
    const tableHeaders = within(table).getAllByRole('columnheader');
    expect(tableHeaders[0]).toHaveTextContent('Date');
    expect(tableHeaders[1]).toHaveTextContent('Account ID');
    expect(tableHeaders[2]).toHaveTextContent('Payment ID');
    expect(tableHeaders[3]).toHaveTextContent('Amount');
    expect(tableHeaders[4]).toHaveTextContent('Reference');
    expect(tableHeaders[5]).toHaveTextContent('Status');
    expect(tableHeaders[6]).toHaveTextContent('Card Details');
    
    // Check if payment data is rendered - use getAllByText for duplicate elements
    const rows = within(table).getAllByRole('row');
    // Skip the header row (index 0)
    const firstDataRow = rows[1];
    
    // Verify the first data row contains expected content
    expect(within(firstDataRow).getByText('A-0001')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('P-0001')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('$120.50')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('REF123456')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('COMPLETED')).toBeInTheDocument();
    expect(within(firstDataRow).getByText('**** **** **** 1234')).toBeInTheDocument();
    
    // API should be called for each account
    expect(mockedApi.getPaymentHistory).toHaveBeenCalledTimes(3);
    expect(mockedApi.getPaymentHistory).toHaveBeenCalledWith('A-0001');
    expect(mockedApi.getPaymentHistory).toHaveBeenCalledWith('A-0004');
    expect(mockedApi.getPaymentHistory).toHaveBeenCalledWith('A-0008');
  });

  test('searches payments by account ID', async () => {
    render(<PaymentHistoryPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Search for an account ID
    fireEvent.change(screen.getByLabelText('Search by Account ID, Payment ID or Reference'), { 
      target: { value: 'A-0004' } 
    });
    
    // Check that only matching payments are shown
    const table = screen.getByRole('table', { name: /payment history table/i });
    const rows = within(table).getAllByRole('row');
    
    // Should have header + 1 data row
    expect(rows.length).toBe(2);
    
    // Check the content of the data row (index 1, after header)
    const dataRow = rows[1];
    expect(within(dataRow).getByText('A-0004')).toBeInTheDocument();
    expect(within(dataRow).getByText('P-0002')).toBeInTheDocument();
  });

  test('searches payments by payment ID', async () => {
    render(<PaymentHistoryPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Search for a payment ID
    fireEvent.change(screen.getByLabelText('Search by Account ID, Payment ID or Reference'), { 
      target: { value: 'P-0003' } 
    });
    
    // Check that only matching payments are shown
    const table = screen.getByRole('table', { name: /payment history table/i });
    const rows = within(table).getAllByRole('row');
    
    // Should have header + 1 data row
    expect(rows.length).toBe(2);
    
    // Check the content of the data row (index 1, after header)
    const dataRow = rows[1];
    expect(within(dataRow).getByText('P-0003')).toBeInTheDocument();
  });

  test('searches payments by reference', async () => {
    render(<PaymentHistoryPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Search for a reference
    fireEvent.change(screen.getByLabelText('Search by Account ID, Payment ID or Reference'), { 
      target: { value: 'REF654321' } 
    });
    
    // Check that only matching payments are shown
    const table = screen.getByRole('table', { name: /payment history table/i });
    const rows = within(table).getAllByRole('row');
    
    // Should have header + 1 data row
    expect(rows.length).toBe(2);
    
    // Check the content of the data row (index 1, after header)
    const dataRow = rows[1];
    expect(within(dataRow).getByText('REF654321')).toBeInTheDocument();
  });

  test('displays error message when API call fails', async () => {
    // Mock API failure for all account calls
    mockedApi.getPaymentHistory.mockRejectedValue(new Error('API Error'));
    
    render(<PaymentHistoryPage />);
    
    // Wait for loading to finish and error to appear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Failed to fetch payment history. Please try again later.')).toBeInTheDocument();
  });

  test('displays message when no payments match filter', async () => {
    render(<PaymentHistoryPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Search for something that doesn't exist
    fireEvent.change(screen.getByLabelText('Search by Account ID, Payment ID or Reference'), { 
      target: { value: 'NOT_EXISTS' } 
    });
    
    // Check that no payments message is shown
    expect(screen.getByText('No payment records found')).toBeInTheDocument();
  });
});