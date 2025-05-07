import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentModal } from '../../components';
import { Account } from '../../types';
import { api } from '../../services/api';

// Mock the API module
jest.mock('../../services/api', () => ({
  api: {
    makePayment: jest.fn(),
  },
}));

describe('PaymentModal Component', () => {
  const mockAccount: Account = {
    id: 'A-1234',
    type: 'ELECTRICITY',
    address: '123 Main St, Anytown, USA',
    meterNumber: 'MET12345'
  };

  // Fixed balance value to use in tests
  const mockBalance = 150.5;
  
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the payment form when open', () => {
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Check for form elements
    expect(screen.getByText('Make a Payment')).toBeInTheDocument();
    expect(screen.getByText(`Account: ${mockAccount.id}`)).toBeInTheDocument();
    expect(screen.getByText(`Balance: $${mockBalance.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByLabelText("Payment Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Card Number")).toBeInTheDocument();
    expect(screen.getByLabelText("Cardholder Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Expiry Date")).toBeInTheDocument();
    expect(screen.getByLabelText("CVV")).toBeInTheDocument();
    expect(screen.getByText(`Pay $${mockBalance.toFixed(2)}`)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <PaymentModal 
        open={false} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    expect(screen.queryByText('Make a Payment')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('validates form and shows errors for invalid inputs', async () => {
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Clear amount field
    const amountInput = screen.getByLabelText("Payment Amount");
    fireEvent.change(amountInput, { target: { value: '0' } });
    
    // Submit the form with empty/invalid fields
    const payButton = screen.getByText(`Pay $0.00`);
    fireEvent.click(payButton);
    
    // Check for validation errors
    await screen.findByText("Amount must be greater than 0");
    await screen.findByText("Card number is required");
    await screen.findByText("Cardholder name is required");
    await screen.findByText("Expiry date is required");
    await screen.findByText("CVV is required");
    
    // API should not be called
    expect(api.makePayment).not.toHaveBeenCalled();
  });

  it('successfully submits payment with valid form data', async () => {
    (api.makePayment as jest.Mock).mockResolvedValueOnce({
      id: 'payment_123',
      accountId: mockAccount.id,
      amount: mockBalance,
      date: new Date().toISOString(),
      method: 'CARD',
      status: 'COMPLETED',
      reference: 'REF123',
      cardDetails: {
        cardNumber: 'xxxx-xxxx-xxxx-1234',
        cardholderName: 'John Doe'
      }
    });
    
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Fill in form fields with valid data
    fireEvent.change(screen.getByLabelText("Card Number"), { 
      target: { value: '4111111111111111' } 
    });
    
    fireEvent.change(screen.getByLabelText("Cardholder Name"), { 
      target: { value: 'John Doe' } 
    });
    
    fireEvent.change(screen.getByLabelText("Expiry Date"), { 
      target: { value: '12/30' } 
    });
    
    fireEvent.change(screen.getByLabelText("CVV"), { 
      target: { value: '123' } 
    });
    
    // Submit the form
    const payButton = screen.getByText(`Pay $${mockBalance.toFixed(2)}`);
    fireEvent.click(payButton);
    
    // Check API called with correct parameters
    expect(api.makePayment).toHaveBeenCalledWith(
      mockAccount.id,
      mockBalance,
      {
        cardNumber: '4111111111111111',
        cardholderName: 'John Doe',
        expiryDate: '12/30',
        cvv: '123'
      }
    );
    
    // Check success view appears
    await screen.findByText('Payment Successful');
    await screen.findByText(`Your payment of $${mockBalance.toFixed(2)} has been processed successfully.`);
  });

  it('handles payment failure gracefully', async () => {
    // Mock API error
    const errorMessage = 'Invalid card details';
    (api.makePayment as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Fill in form fields with valid data
    fireEvent.change(screen.getByLabelText("Card Number"), { 
      target: { value: '4111111111111111' } 
    });
    
    fireEvent.change(screen.getByLabelText("Cardholder Name"), { 
      target: { value: 'John Doe' } 
    });
    
    fireEvent.change(screen.getByLabelText("Expiry Date"), { 
      target: { value: '12/30' } 
    });
    
    fireEvent.change(screen.getByLabelText("CVV"), { 
      target: { value: '123' } 
    });
    
    // Submit the form
    const payButton = screen.getByText(`Pay $${mockBalance.toFixed(2)}`);
    fireEvent.click(payButton);
    
    // Check error message appears
    await screen.findByText(errorMessage);
    
    // Success view should not appear
    expect(screen.queryByText('Payment Successful')).not.toBeInTheDocument();
  });

  it('updates amount field when user changes the value', () => {
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    const amountInput = screen.getByLabelText("Payment Amount");
    fireEvent.change(amountInput, { target: { value: '75.50' } });
    
    const payButton = screen.getByText('Pay $75.50');
    expect(payButton).toBeInTheDocument();
  });

  it('validates card expiry date format', async () => {
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText("Card Number"), { 
      target: { value: '4111111111111111' } 
    });
    
    fireEvent.change(screen.getByLabelText("Cardholder Name"), { 
      target: { value: 'John Doe' } 
    });
    
    // Enter invalid expiry date format
    fireEvent.change(screen.getByLabelText("Expiry Date"), { 
      target: { value: '1230' } // Invalid format (should be MM/YY)
    });
    
    fireEvent.change(screen.getByLabelText("CVV"), { 
      target: { value: '123' } 
    });
    
    // Submit the form
    const payButton = screen.getByText(`Pay $${mockBalance.toFixed(2)}`);
    fireEvent.click(payButton);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText("Invalid format (use MM/YY)")).toBeInTheDocument();
    });
  });

  it('validates expired card and shows appropriate error', async () => {
    // Mock current date to be 2025-05-06 (from context)
    const realDate = Date;
    global.Date = class extends Date {
      constructor(date?: string | number | Date) {
        if (date) {
          super(date);
        } else {
          super('2025-05-06');
        }
      }
    } as any;

    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Fill form with all fields valid except expiry date
    fireEvent.change(screen.getByLabelText("Card Number"), { 
      target: { value: '4111111111111111' } 
    });
    
    fireEvent.change(screen.getByLabelText("Cardholder Name"), { 
      target: { value: 'John Doe' } 
    });
    
    // Enter expired date (before current date)
    fireEvent.change(screen.getByLabelText("Expiry Date"), { 
      target: { value: '01/25' } // Expired (May 2025 is current date)
    });
    
    fireEvent.change(screen.getByLabelText("CVV"), { 
      target: { value: '123' } 
    });
    
    // Submit the form
    const payButton = screen.getByText(`Pay $${mockBalance.toFixed(2)}`);
    fireEvent.click(payButton);
    
    // Check for expired card error
    await waitFor(() => {
      expect(screen.getByText("Card has expired")).toBeInTheDocument();
    });

    // Restore original Date implementation
    global.Date = realDate;
  });

  it('validates card number format correctly', async () => {
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Fill form with invalid card number
    fireEvent.change(screen.getByLabelText("Card Number"), { 
      target: { value: '411111' } // Too short
    });
    
    fireEvent.change(screen.getByLabelText("Cardholder Name"), { 
      target: { value: 'John Doe' } 
    });
    
    fireEvent.change(screen.getByLabelText("Expiry Date"), { 
      target: { value: '12/30' } 
    });
    
    fireEvent.change(screen.getByLabelText("CVV"), { 
      target: { value: '123' } 
    });
    
    // Submit the form
    const payButton = screen.getByText(`Pay $${mockBalance.toFixed(2)}`);
    fireEvent.click(payButton);
    
    // Check for invalid card format error
    await waitFor(() => {
      expect(screen.getByText("Invalid card number format")).toBeInTheDocument();
    });
  });

  it('clears field error when user types in that field', async () => {
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Trigger validation errors
    const payButton = screen.getByText(`Pay $${mockBalance.toFixed(2)}`);
    fireEvent.click(payButton);
    
    // Verify error appears
    await waitFor(() => {
      expect(screen.getByText("Card number is required")).toBeInTheDocument();
    });
    
    // Type in the field with error
    fireEvent.change(screen.getByLabelText("Card Number"), { 
      target: { value: '4111111111111111' } 
    });
    
    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText("Card number is required")).not.toBeInTheDocument();
    });
  });

  it('tests close button in success view works correctly', async () => {
    // Mock successful payment
    (api.makePayment as jest.Mock).mockResolvedValueOnce({});
    
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Fill in form fields with valid data and submit
    fireEvent.change(screen.getByLabelText("Card Number"), { target: { value: '4111111111111111' } });
    fireEvent.change(screen.getByLabelText("Cardholder Name"), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText("Expiry Date"), { target: { value: '12/30' } });
    fireEvent.change(screen.getByLabelText("CVV"), { target: { value: '123' } });
    
    const payButton = screen.getByText(`Pay $${mockBalance.toFixed(2)}`);
    fireEvent.click(payButton);
    
    // Wait for success view to appear
    await screen.findByText('Payment Successful');
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the X button in header', () => {
    render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Find the close icon button in the header (aria-label="close")
    const closeIconButton = screen.getByLabelText('close');
    fireEvent.click(closeIconButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('resets state when modal reopens with a new account', () => {
    const { rerender } = render(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    // Change amount
    const amountInput = screen.getByLabelText("Payment Amount");
    fireEvent.change(amountInput, { target: { value: '50' } });
    
    // Verify amount changed
    expect(screen.getByText('Pay $50.00')).toBeInTheDocument();
    
    // New account with different balance
    const newBalance = 200;
    const newAccount: Account = { 
      id: 'A-5678', 
      type: 'GAS' as const, 
      address: '456 Oak Ave',
      volume: 2500
    };
    
    // Close and reopen with new account
    rerender(
      <PaymentModal 
        open={false} 
        onClose={mockOnClose} 
        account={mockAccount}
        balance={mockBalance}
      />
    );
    
    rerender(
      <PaymentModal 
        open={true} 
        onClose={mockOnClose} 
        account={newAccount}
        balance={newBalance}
      />
    );
    
    // Check if amount was reset to new account's balance
    expect(screen.getByText(`Pay $${newBalance.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Account: ${newAccount.id}`)).toBeInTheDocument();
  });
});