import { Router } from 'express';
import { AccountsController } from '../controllers/accountsController';

export const accountsRouter = Router();
const accountsController = new AccountsController();

// GET all accounts
accountsRouter.get('/', (req, res) => accountsController.getAccounts(req, res));

// GET account by ID
accountsRouter.get('/:accountId', (req, res) => accountsController.getAccountById(req, res));

export default accountsRouter;