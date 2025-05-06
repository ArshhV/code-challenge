export type AccountType = 'ELECTRICITY' | 'GAS';

export interface Account {
  id: string;
  type: AccountType;
  address: string;
  meterNumber?: string;
  volume?: number;
  balance: number;
  accountNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface DueCharge {
  id: string;
  accountId: string;
  amount: number;
  date: string;  // Changed from dueDate to match the mock implementation
  dueDate?: string; // Keep as optional for backward compatibility
  description?: string; // Optional since it's not in the mock
  paid?: boolean; // Optional since it's not in the mock
}

export interface CreditCardDetails {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

export interface Payment {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  method: 'CARD' | 'BANK_TRANSFER' | 'DIRECT_DEBIT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference: string;
  cardDetails?: {
    cardNumber: string;
    cardholderName: string;
  };
}