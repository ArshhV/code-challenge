export interface DueCharge {
  id: string;
  accountId: string;
  amount: number;
  date: string;  // Primary field to match mock implementation
  dueDate?: string; // Keep for backward compatibility
  description?: string;
  paid?: boolean;
}