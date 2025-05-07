export interface DueCharge {
  id: string;
  accountId: string;
  amount: number;
  date: string;  // Primary field to match mock implementation
  description?: string;
  paid?: boolean;
}