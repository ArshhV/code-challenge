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
    balance: 150.5,
    firstName: 'John',
    lastName: 'Doe',
    accountNumber: 'ACC12345',
    email: 'john.doe@example.com',
    phoneNumber: '555-123-4567'
  };

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
      />
    );
    
    // Check for form elements
    expect(screen.getByText('Make a Payment')).toBeInTheDocument();
    expect(screen.getByText(`Account: ${mockAccount.id}`)).toBeInTheDocument();
    expect(screen.getByText(`Balance: $${mockAccount.balance.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Card Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cardholder Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expiry Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CVV/i)).toBeInTheDocument();
    expect(screen.getByText(`Pay $${mockAccount.balance.toFixed(2)}`)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <PaymentModal 
        open={false} 
        onClose={mockOnClose} 
        account={mockAccount} 
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
      />
    );
    
    // Clear amount field
    const amountInput = screen.getByLabelText(/Payment Amount/i);
    fireEvent.change(amountInput, { target: { value: '0' } });
    
    // Submit the form with empty/invalid fields
    const payButton = screen.getByText(`Pay $0.00`);
    fireEvent.click(payButton);
    
    // Check for validation errors
    await screen.findByText(/Amount must be greater than 0/i);
    await screen.findByText(/Card number is required/i);
    await screen.findByText(/Cardholder name is required/i);
    await screen.findByText(/Expiry date is required/i);
    await screen.findByText(/CVV is required/i);
    
    // API should not be called
    expect(api.makePayment).not.toHaveBeenCalled();
  });

  it('successfully submits payment with valid form data', async () => {
    (api.makePayment as jest.Mock).mockResolvedValueOnce({
      id: 'payment_123',
      accountId: mockAccount.id,
      amount: mockAccount.balance,
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
      />
    );
    
    // Fill in form fields with valid data
    fireEvent.change(screen.getByLabelText(/Card Number/i), { 
      target: { value: '4111111111111111' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Cardholder Name/i), { 
      target: { value: 'John Doe' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Expiry Date/i), { 
      target: { value: '12/30' } 
    });
    
    fireEvent.change(screen.getByLabelText(/CVV/i), { 
      target: { value: '123' } 
    });
    
    // Submit the form
    const payButton = screen.getByText(`Pay $${mockAccount.balance.toFixed(2)}`);
    fireEvent.click(payButton);
    
    // Check API called with correct parameters
    expect(api.makePayment).toHaveBeenCalledWith(
      mockAccount.id,
      mockAccount.balance,
      {
        cardNumber: '4111111111111111',
        cardholderName: 'John Doe',
        expiryDate: '12/30',
        cvv: '123'
      }
    );
    
    // Check success view appears
    await screen.findByText('Payment Successful');
    await screen.findByText(`Your payment of $${mockAccount.balance.toFixed(2)} has been processed successfully.`);
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
      />
    );
    
    // Fill in form fields with valid data
    fireEvent.change(screen.getByLabelText(/Card Number/i), { 
      target: { value: '4111111111111111' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Cardholder Name/i), { 
      target: { value: 'John Doe' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Expiry Date/i), { 
      target: { value: '12/30' } 
    });
    
    fireEvent.change(screen.getByLabelText(/CVV/i), { 
      target: { value: '123' } 
    });
    
    // Submit the form
    const payButton = screen.getByText(`Pay $${mockAccount.balance.toFixed(2)}`);
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
      />
    );
    
    const amountInput = screen.getByLabelText(/Payment Amount/i);
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
      />
    );
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/Card Number/i), { 
      target: { value: '4111111111111111' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Cardholder Name/i), { 
      target: { value: 'John Doe' } 
    });
    
    // Enter invalid expiry date format
    fireEvent.change(screen.getByLabelText(/Expiry Date/i), { 
      target: { value: '1230' } // Invalid format (should be MM/YY)
    });
    
    fireEvent.change(screen.getByLabelText(/CVV/i), { 
      target: { value: '123' } 
    });
    
    // Submit the form
    const payButton = screen.getByText(`Pay $${mockAccount.balance.toFixed(2)}`);
    fireEvent.click(payButton);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid format \(use MM\/YY\)/i)).toBeInTheDocument();
    });
  });
});