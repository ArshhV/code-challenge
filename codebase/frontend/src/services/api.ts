import axios, { AxiosError } from 'axios';
import { Account, CreditCardDetails, DueCharge, Payment } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds
});

// Error handling helper
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const data = axiosError.response.data as { error?: string; message?: string };
      const errorMessage = data.error || data.message || 'An error occurred';
      throw new Error(`API Error (${axiosError.response.status}): ${errorMessage}`);
    } else if (axiosError.request) {
      // The request was made but no response was received
      throw new Error('The server did not respond. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Request configuration error: ${axiosError.message}`);
    }
  }
  // For non-axios errors, just rethrow
  throw error;
};

export const api = {
  // Accounts
  getAccounts: async (): Promise<Account[]> => {
    try {
      const response = await apiClient.get('/accounts');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAccountById: async (accountId: string): Promise<Account> => {
    try {
      const response = await apiClient.get(`/accounts/${accountId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Payments
  getDueCharges: async (accountId: string): Promise<DueCharge[]> => {
    try {
      const response = await apiClient.get(`/payments/${accountId}/due-charges`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  makePayment: async (accountId: string, amount: number, cardDetails: CreditCardDetails): Promise<Payment> => {
    try {
      const response = await apiClient.post(`/payments/${accountId}/payment`, {
        amount,
        method: 'CARD',
        cardDetails
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getPaymentHistory: async (accountId: string): Promise<Payment[]> => {
    try {
      const response = await apiClient.get(`/payments/${accountId}/history`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};