import { DueCharge } from '../models/DueCharge';
import { Payment, PaymentMethod, PaymentStatus, CreditCardDetails } from '../models/Payment';
import { getDueCharges } from '../mocks/dueChargesAPIMock';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for payments (in a real app, this would be a database)
const payments: Payment[] = [];

export class PaymentService {
  /**
   * Get due charges for a specific account
   * @param accountId The ID of the account to get due charges for
   * @returns Promise that resolves to an array of due charges
   */
  public async getDueCharges(accountId: string): Promise<DueCharge[]> {
    try {
      // In a real application, this would call an API or database
      const allDueCharges = await getDueCharges();
      const accountDueCharges = allDueCharges.filter(
        charge => charge.accountId === accountId
      );
      return accountDueCharges;
    } catch (error) {
      console.error(`Error in payment service getDueCharges for account ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Validates credit card details
   * @param cardDetails The credit card details to validate
   * @throws Error if validation fails
   */
  private validateCardDetails(cardDetails: CreditCardDetails): void {
    // Basic validation - would be more robust in production
    if (!cardDetails.cardNumber.match(/^\d{13,19}$/)) {
      throw new Error('Invalid card number');
    }
    
    if (!cardDetails.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      throw new Error('Invalid expiry date format (MM/YY)');
    }
    
    const [month, year] = cardDetails.expiryDate.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiryDate < new Date()) {
      throw new Error('Card has expired');
    }
    
    if (!cardDetails.cvv.match(/^\d{3,4}$/)) {
      throw new Error('Invalid CVV');
    }
  }

  /**
   * Masks the card number for security
   * @param cardNumber The original card number
   * @returns The masked card number
   */
  private maskCardNumber(cardNumber: string): string {
    return `xxxx-xxxx-xxxx-${cardNumber.slice(-4)}`;
  }

  /**
   * Process a payment for a specific account
   * @param accountId The ID of the account making the payment
   * @param paymentDetails The payment details
   * @returns Promise that resolves to the payment result
   */
  public async makePayment(
    accountId: string, 
    paymentDetails: { 
      amount: number; 
      method: PaymentMethod; 
      chargeIds?: string[]; 
      cardDetails?: CreditCardDetails 
    }
  ): Promise<Payment> {
    try {
      // Validate inputs
      if (!accountId) {
        throw new Error('Account ID is required');
      }
      
      if (!paymentDetails.amount || paymentDetails.amount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }
      
      // If card payment, validate card details
      if (paymentDetails.method === PaymentMethod.CARD && paymentDetails.cardDetails) {
        this.validateCardDetails(paymentDetails.cardDetails);
        
        // Create a masked version of the card details for storing/returning
        const maskedCardDetails = {
          cardNumber: this.maskCardNumber(paymentDetails.cardDetails.cardNumber),
          cardholderName: paymentDetails.cardDetails.cardholderName
        };
        
        // Create a payment record with masked card details
        const payment: Payment = {
          id: `payment_${uuidv4().substring(0, 8)}`,
          accountId,
          amount: paymentDetails.amount,
          date: new Date().toISOString(),
          method: paymentDetails.method,
          status: PaymentStatus.COMPLETED,
          reference: `PAY-${Date.now()}`,
          cardDetails: maskedCardDetails
        };
        
        // In a real application, this would call a payment processor API
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store the payment in our in-memory store
        payments.push(payment);
        
        return payment;
      } else {
        throw new Error('Only card payments are supported');
      }
    } catch (error: any) {
      console.error(`Error in payment service makePayment for account ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Get the payment history for an account
   * @param accountId The account ID to get payment history for
   * @returns Array of payment records for the account
   */
  public async getPaymentHistory(accountId: string): Promise<Payment[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return a copy of the payments array filtered by accountId and sorted by date (newest first)
      return [...payments]
        .filter(payment => payment.accountId === accountId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error(`Error in payment service getPaymentHistory for account ${accountId}:`, error);
      throw error;
    }
  }
}

// Create an instance of the PaymentService for use throughout the app
const paymentServiceInstance = new PaymentService();

// Export methods to match what the tests expect
export const processPayment = (
  accountId: string,
  amount: number,
  cardDetails: CreditCardDetails
): Promise<Payment> => {
  return paymentServiceInstance.makePayment(accountId, {
    amount,
    method: PaymentMethod.CARD,
    cardDetails
  });
};

export const getPaymentHistory = (accountId: string): Promise<Payment[]> => {
  return paymentServiceInstance.getPaymentHistory(accountId);
};

// Add some example payments for testing
// In a real application, these would be stored in a database
payments.push({
  id: 'payment_12345678',
  accountId: 'A-0001',
  amount: 30,
  date: '2025-05-01T09:30:00Z',
  method: PaymentMethod.CARD,
  status: PaymentStatus.COMPLETED,
  reference: 'PAY-1234567890',
  cardDetails: {
    cardNumber: 'xxxx-xxxx-xxxx-1234',
    cardholderName: 'John Smith'
  }
});

payments.push({
  id: 'payment_23456789',
  accountId: 'A-0004',
  amount: 50,
  date: '2025-04-28T14:15:00Z',
  method: PaymentMethod.CARD,
  status: PaymentStatus.COMPLETED,
  reference: 'PAY-2345678901',
  cardDetails: {
    cardNumber: 'xxxx-xxxx-xxxx-5678',
    cardholderName: 'Michael Brown'
  }
});

payments.push({
  id: 'payment_34567890',
  accountId: 'A-0008',
  amount: 120,
  date: '2025-04-25T11:45:00Z',
  method: PaymentMethod.CARD,
  status: PaymentStatus.COMPLETED,
  reference: 'PAY-3456789012',
  cardDetails: {
    cardNumber: 'xxxx-xxxx-xxxx-9012',
    cardholderName: 'Matthew Anderson'
  }
});

// Export the instance for direct usage
export default paymentServiceInstance;