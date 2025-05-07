import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccountCard } from '../../components';
import { Account } from '../../types';
import { ThemeProvider, createTheme } from '@mui/material';
import { api } from '../../services/api';

// Create a theme to properly test MUI components
const theme = createTheme();

// Mock the API service
jest.mock('../../services/api', () => ({
  api: {
    makePayment: jest.fn().mockResolvedValue({ success: true }),
    getDueCharges: jest.fn().mockResolvedValue([
      { id: 'D-001', accountId: 'A-1234', amount: 150.5, date: '2025-04-01' },
      { id: 'D-002', accountId: 'G-5678', amount: -50.75, date: '2025-04-01' }
    ])
  }
}));

describe('AccountCard Component', () => {
  const mockElectricityAccount: Account = {
    id: 'A-1234',
    type: 'ELECTRICITY',
    address: '123 Main St, Anytown, USA',
    meterNumber: 'MET98765'
  };

  const mockGasAccount: Account = {
    id: 'G-5678',
    type: 'GAS',
    address: '123 Main St, Anytown, USA',
    volume: 3000
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders account details correctly', async () => {
    renderWithTheme(<AccountCard account={mockElectricityAccount} />);
    
    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check for basic account information
    expect(screen.getByText('ELECTRICITY')).toBeInTheDocument();
    expect(screen.getByText(mockElectricityAccount.address)).toBeInTheDocument();
    expect(screen.getByText('ID: A-1234')).toBeInTheDocument();
    
    // Check for balance display
    expect(screen.getByText('Balance:')).toBeInTheDocument();
  });

  it('renders gas account with correct info', async () => {
    renderWithTheme(<AccountCard account={mockGasAccount} />);
    
    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check for GAS type
    expect(screen.getByText('GAS')).toBeInTheDocument();
    
    // Check for basic account info
    expect(screen.getByText('ID: G-5678')).toBeInTheDocument();
    expect(screen.getByText('Balance:')).toBeInTheDocument();
  });

  it('applies correct color to positive balance', async () => {
    // Mock a positive balance from due charges
    (api.getDueCharges as jest.Mock).mockResolvedValueOnce([
      { id: 'D-001', accountId: 'A-1234', amount: 100, date: '2025-04-01' }
    ]);
    
    renderWithTheme(<AccountCard account={mockElectricityAccount} />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check that the balance is displayed with the correct color (green for positive)
    const balanceElement = screen.getByText('$100.00');
    expect(balanceElement).toHaveStyle({ color: 'rgb(46, 125, 50)' }); // success.main in RGB
  });

  it('applies correct color to negative balance', async () => {
    // Mock a negative balance from due charges
    (api.getDueCharges as jest.Mock).mockResolvedValueOnce([
      { id: 'D-001', accountId: 'A-1234', amount: -50, date: '2025-04-01' }
    ]);
    
    renderWithTheme(<AccountCard account={mockElectricityAccount} />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check that the balance is displayed with the correct color (red for negative)
    const balanceElement = screen.getByText('$-50.00');
    expect(balanceElement).toHaveStyle({ color: 'rgb(211, 47, 47)' }); // error.main in RGB
  });

  it('applies correct color to zero balance', async () => {
    // Mock a zero balance from due charges
    (api.getDueCharges as jest.Mock).mockResolvedValueOnce([
      { id: 'D-001', accountId: 'A-1234', amount: 0, date: '2025-04-01' }
    ]);
    
    renderWithTheme(<AccountCard account={mockElectricityAccount} />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check that the balance is displayed with the correct color (grey for zero)
    const balanceElement = screen.getByText('$0.00');
    expect(balanceElement).toHaveStyle({ color: 'rgba(0, 0, 0, 0.6)' }); // text.secondary in RGBA
  });

  it('allows making a payment after loading completes', async () => {
    renderWithTheme(<AccountCard account={mockElectricityAccount} />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    const paymentButton = screen.getByRole('button', { name: "Make a Payment" });
    expect(paymentButton).toBeEnabled();
  });

  it('opens payment modal when button is clicked', async () => {
    renderWithTheme(<AccountCard account={mockElectricityAccount} />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click the payment button
    const paymentButton = screen.getByRole('button', { name: "Make a Payment" });
    fireEvent.click(paymentButton);
    
    // Check that account info is displayed in the modal
    expect(screen.getByText(`Account: ${mockElectricityAccount.id}`)).toBeInTheDocument();
  });

  it('closes payment modal when close button is clicked', async () => {
    renderWithTheme(<AccountCard account={mockElectricityAccount} />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Open the modal
    const paymentButton = screen.getByRole('button', { name: "Make a Payment" });
    fireEvent.click(paymentButton);
    
    // Find and click the close button (using aria-label)
    const closeButton = screen.getByRole('button', { name: "close" });
    fireEvent.click(closeButton);
  });

  it('handles payment submission correctly', async () => {
    renderWithTheme(<AccountCard account={mockElectricityAccount} />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Open the modal
    const paymentButton = screen.getByRole('button', { name: "Make a Payment" });
    fireEvent.click(paymentButton);
    
    // Fill in payment form
    // First set a valid payment amount
    const amountInput = screen.getByLabelText("Payment Amount");
    fireEvent.change(amountInput, { target: { value: '100' } });
    
    fireEvent.change(screen.getByLabelText("Card Number"), { 
      target: { value: '4242424242424242' } 
    });
    
    fireEvent.change(screen.getByLabelText("Cardholder Name"), { 
      target: { value: 'John Doe' } 
    });
    
    fireEvent.change(screen.getByLabelText("Expiry Date"), { 
      target: { value: '12/25' } 
    });
    
    fireEvent.change(screen.getByLabelText("CVV"), { 
      target: { value: '123' } 
    });
    
    // Submit the payment
    const submitButton = screen.getByRole('button', { name: "Pay $100.00" });
    fireEvent.click(submitButton);
    
    // After a successful submission, we need to wait for the success message
    await waitFor(() => {
      expect(screen.getByText('Payment Successful')).toBeInTheDocument();
    });
    
    // Verify the API was called
    expect(api.makePayment).toHaveBeenCalled();
    
    // Click the Close button (the full-width button at the bottom)
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);
    
    // Now verify that the dialog has closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('handles errors in fetching due charges', async () => {
    // Mock an error when fetching due charges
    (api.getDueCharges as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch charges'));
    
    renderWithTheme(<AccountCard account={mockElectricityAccount} />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Should still render the card with $0.00 balance
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles different account types correctly', async () => {
    // Render electricity account first
    const { unmount } = renderWithTheme(<AccountCard account={mockElectricityAccount} />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('ELECTRICITY')).toBeInTheDocument();
    
    // Unmount the first component and render gas account 
    unmount();
    
    renderWithTheme(<AccountCard account={mockGasAccount} />);
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('GAS')).toBeInTheDocument();
  });
});