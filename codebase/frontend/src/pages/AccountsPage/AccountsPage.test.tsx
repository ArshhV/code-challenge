import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountsPage from './AccountsPage';
import { api } from '../../services/api';
import { Account } from '../../types';

// Mock the API module
jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock the AccountCard component
jest.mock('../../components/AccountCard/AccountCard', () => {
  return function MockAccountCard({ account }: { account: Account }) {
    return (
      <div data-testid={`account-card-${account.id}`}>
        <div data-testid="account-type">{account.type}</div>
        <div data-testid="account-address">{account.address}</div>
      </div>
    );
  };
});

describe('AccountsPage', () => {
  const mockAccounts: Account[] = [
    {
      id: 'A-0001',
      type: 'ELECTRICITY',
      address: '123 Main St',
      balance: 150.75,
      meterNumber: 'E-12345',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '555-123-4567'
    },
    {
      id: 'A-0002',
      type: 'GAS',
      address: '456 Oak Ave',
      balance: 85.20,
      meterNumber: 'G-67890',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '555-987-6543'
    },
    {
      id: 'A-0003',
      type: 'ELECTRICITY',
      address: '789 Pine Blvd',
      balance: 210.30,
      meterNumber: 'E-54321',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      phoneNumber: '555-456-7890'
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Mock the API response
    mockedApi.getAccounts.mockResolvedValue(mockAccounts);
  });

  test('renders loading state initially', () => {
    render(<AccountsPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders accounts after loading', async () => {
    render(<AccountsPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if all accounts are rendered
    expect(screen.getByText('Energy Accounts')).toBeInTheDocument();
    expect(screen.getByTestId('account-card-A-0001')).toBeInTheDocument();
    expect(screen.getByTestId('account-card-A-0002')).toBeInTheDocument();
    expect(screen.getByTestId('account-card-A-0003')).toBeInTheDocument();
  });

  test('filters accounts by energy type', async () => {
    render(<AccountsPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Select Electricity filter - use the id instead of label text which has duplicates
    const filterElement = screen.getByLabelText(/Energy Type/i);
    fireEvent.mouseDown(filterElement);
    
    // Now click the menu item for Electricity
    const electricityOption = screen.getByRole('option', { name: /Electricity/i });
    fireEvent.click(electricityOption);
    
    // Check that only electricity accounts are shown
    expect(screen.getByTestId('account-card-A-0001')).toBeInTheDocument();
    expect(screen.getByTestId('account-card-A-0003')).toBeInTheDocument();
    expect(screen.queryByTestId('account-card-A-0002')).not.toBeInTheDocument();
    
    // Select Gas filter
    fireEvent.mouseDown(filterElement); 
    const gasOption = screen.getByRole('option', { name: /Gas/i });
    fireEvent.click(gasOption);
    
    // Check that only gas accounts are shown
    expect(screen.getByTestId('account-card-A-0002')).toBeInTheDocument();
    expect(screen.queryByTestId('account-card-A-0001')).not.toBeInTheDocument();
    expect(screen.queryByTestId('account-card-A-0003')).not.toBeInTheDocument();
  });

  test('filters accounts by address search', async () => {
    render(<AccountsPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Search for an address
    fireEvent.change(screen.getByLabelText('Search by Address'), { 
      target: { value: 'Oak' } 
    });
    
    // Check that only matching accounts are shown
    expect(screen.getByTestId('account-card-A-0002')).toBeInTheDocument();
    expect(screen.queryByTestId('account-card-A-0001')).not.toBeInTheDocument();
    expect(screen.queryByTestId('account-card-A-0003')).not.toBeInTheDocument();
  });

  test('displays error message when API call fails', async () => {
    // Mock API failure
    mockedApi.getAccounts.mockRejectedValue(new Error('API Error'));
    
    render(<AccountsPage />);
    
    // Wait for loading to finish and error to appear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch accounts. Please try again later.')).toBeInTheDocument();
  });

  test('displays message when no accounts match filters', async () => {
    render(<AccountsPage />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Search for an address that doesn't exist
    fireEvent.change(screen.getByLabelText('Search by Address'), { 
      target: { value: 'This address does not exist' } 
    });
    
    // Check that no accounts message is shown
    expect(screen.getByText('No accounts found matching your filters.')).toBeInTheDocument();
  });
});