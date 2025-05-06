export interface CreditCardDetails {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

export interface MaskedCardDetails {
  cardNumber: string;
  cardholderName: string;
}

export interface Payment {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  cardDetails?: MaskedCardDetails;
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIRECT_DEBIT = 'DIRECT_DEBIT'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}