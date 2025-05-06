import { Request, Response } from 'express';
import { PaymentService } from '../../services/paymentService';

export class PaymentsController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Get due charges for a specific account
   * @param req Express request object with accountId parameter
   * @param res Express response object
   */
  public async getDueCharges(req: Request, res: Response): Promise<void> {
    try {
      const accountId = req.params.accountId;
      const dueCharges = await this.paymentService.getDueCharges(accountId);
      
      res.status(200).json(dueCharges);
    } catch (error) {
      console.error(`Error fetching due charges for account ${req.params.accountId}:`, error);
      res.status(500).json({ error: 'Failed to fetch due charges' });
    }
  }

  /**
   * Process a payment for a specific account
   * @param req Express request object with accountId parameter and payment details in body
   * @param res Express response object
   */
  public async makePayment(req: Request, res: Response): Promise<void> {
    try {
      const accountId = req.params.accountId;
      const paymentDetails = req.body;
      
      // Basic validation
      if (!paymentDetails.amount || paymentDetails.amount <= 0) {
        res.status(400).json({ error: 'Payment amount must be greater than zero' });
        return;
      }
      
      if (!paymentDetails.method || !paymentDetails.cardDetails) {
        res.status(400).json({ error: 'Payment method and card details are required' });
        return;
      }
      
      const paymentResult = await this.paymentService.makePayment(accountId, paymentDetails);
      
      res.status(201).json(paymentResult);
    } catch (error: any) {
      console.error(`Error processing payment for account ${req.params.accountId}:`, error);
      res.status(400).json({ error: error.message || 'Error processing payment' });
    }
  }

  /**
   * Get payment history for a specific account
   * @param req Express request object with accountId parameter
   * @param res Express response object
   */
  public async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const accountId = req.params.accountId;
      const paymentHistory = await this.paymentService.getPaymentHistory(accountId);
      
      res.status(200).json(paymentHistory);
    } catch (error) {
      console.error(`Error fetching payment history for account ${req.params.accountId}:`, error);
      res.status(500).json({ error: 'Failed to fetch payment history' });
    }
  }
}