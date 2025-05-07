import { Account } from '../models/Account';
import { DueCharge } from '../models/DueCharge';
import { getEnergyAccounts } from '../mocks/energyAccountsAPIMock';
import { getDueCharges } from '../mocks/dueChargesAPIMock';

export class AccountService {
  /**
   * Get all energy accounts
   * @returns Promise that resolves to an array of accounts
   */
  public async getAccounts(): Promise<Account[]> {
    try {
      // In a real application, this would call an API or database
      const accounts = await getEnergyAccounts();
      return accounts;
    } catch (error) {
      console.error('Error in account service getAccounts:', error);
      throw error;
    }
  }

  /**
   * Get a specific energy account by ID
   * @param accountId The ID of the account to retrieve
   * @returns Promise that resolves to an account or null if not found
   */
  public async getAccountById(accountId: string): Promise<Account | null> {
    try {
      // In a real application, this would call an API or database with the ID
      const accounts = await getEnergyAccounts();
      const account = accounts.find(account => account.id === accountId);
      return account || null;
    } catch (error) {
      console.error(`Error in account service getAccountById for account ${accountId}:`, error);
      throw error;
    }
  }
}

export async function getAccountsWithBalances(): Promise<Account[]> {
  try {
    // Fetch accounts and due charges in parallel
    const [accounts, dueCharges] = await Promise.all([
      getEnergyAccounts(), // Use the same function as the AccountService class
      getDueCharges()
    ]) as [Account[], DueCharge[]];

    // Calculate balance for each account
    return accounts.map((account: Account) => {
      const accountCharges = dueCharges.filter(charge => charge.accountId === account.id);
      const balance = accountCharges.reduce((sum, charge) => sum + charge.amount, 0);
      
      return {
        ...account,
        balance
      };
    });
  } catch (error) {
    console.error('Error fetching accounts with balances:', error);
    throw new Error('Failed to fetch accounts with balances');
  }
}