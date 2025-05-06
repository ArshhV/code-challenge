export type AccountType = 'ELECTRICITY' | 'GAS';

export interface Account {
  id: string;
  type: AccountType;
  address: string;
  meterNumber?: string; // For electricity accounts
  volume?: number; // For gas accounts
  accountNumber?: string;
  balance?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}