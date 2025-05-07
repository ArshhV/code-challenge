export type AccountType = 'ELECTRICITY' | 'GAS';

// Base interface shared by both account types
export interface BaseAccount {
  id: string;
  type: AccountType;
  address: string;
}

// ElectricityAccount has required meterNumber
export interface ElectricityAccount extends BaseAccount {
  type: 'ELECTRICITY';
  meterNumber: string;
}

// GasAccount has required volume
export interface GasAccount extends BaseAccount {
  type: 'GAS';
  volume: number;
}

// Account is a union type of ElectricityAccount and GasAccount
export type Account = ElectricityAccount | GasAccount;

export interface DueCharge {
  id: string;
  accountId: string;
  amount: number;
  date: string;
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