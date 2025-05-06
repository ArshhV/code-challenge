import { Request, Response } from 'express';
import { AccountService, getAccountsWithBalances } from '../../services/accountService';

export class AccountsController {
  private accountService: AccountService;

  constructor() {
    this.accountService = new AccountService();
  }

  /**
   * Get all energy accounts with their balances
   * @param req Express request object
   * @param res Express response object
   */
  public async getAccounts(req: Request, res: Response): Promise<void> {
    try {
      // Use getAccountsWithBalances instead of this.accountService.getAccounts()
      const accounts = await getAccountsWithBalances();
      res.status(200).json(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  }

  /**
   * Get a specific energy account by ID
   * @param req Express request object with accountId parameter
   * @param res Express response object
   */
  public async getAccountById(req: Request, res: Response): Promise<void> {
    try {
      const accountId = req.params.accountId;
      const account = await this.accountService.getAccountById(accountId);
      
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }
      
      res.status(200).json(account);
    } catch (error) {
      console.error(`Error fetching account ${req.params.accountId}:`, error);
      res.status(500).json({ message: 'Error fetching account' });
    }
  }
}