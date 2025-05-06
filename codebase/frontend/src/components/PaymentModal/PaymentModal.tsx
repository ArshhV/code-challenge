import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Account, CreditCardDetails } from '../../types';
import { api } from '../../services/api';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  account: Account;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, account }) => {
  // Payment state
  const [amount, setAmount] = useState<number>(account?.balance || 0);
  const [cardDetails, setCardDetails] = useState<CreditCardDetails>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Refs
  const dialogContentRef = useRef<HTMLDivElement>(null);
  
  // Reset state when modal opens with new account
  useEffect(() => {
    if (open && account) {
      setAmount(account.balance || 0);
      setCardDetails({
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvv: ''
      });
      setIsSubmitting(false);
      setIsSuccess(false);
      setErrors({});
      setApiError(null);
    }
  }, [open, account]);

  // Handle input changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails((prev: CreditCardDetails) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field as user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Amount validation
    if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    // Card number validation (using Luhn algorithm for more thorough validation)
    if (!cardDetails.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{13,19}$/.test(cardDetails.cardNumber.trim())) {
      newErrors.cardNumber = 'Invalid card number format';
    }
    
    // Cardholder name validation
    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    // Expiry date validation
    if (!cardDetails.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate.trim())) {
      newErrors.expiryDate = 'Invalid format (use MM/YY)';
    } else {
      // Check if card is expired
      const [month, year] = cardDetails.expiryDate.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiryDate < new Date()) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    
    // CVV validation
    if (!cardDetails.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cardDetails.cvv.trim())) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous API errors
    setApiError(null);
    
    // Validate form inputs
    if (!validateForm()) {
      // Scroll to first error if needed
      if (dialogContentRef.current) {
        const firstErrorField = dialogContentRef.current.querySelector('.Mui-error');
        firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.makePayment(account.id, amount, cardDetails);
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('An unexpected error occurred while processing your payment.');
      }
      // Scroll to error message
      if (dialogContentRef.current) {
        dialogContentRef.current.scrollTop = 0;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      
      // Reset state after animation completes
      setTimeout(() => {
        setIsSuccess(false);
        setApiError(null);
      }, 300);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="payment-dialog-title"
    >
      {isSuccess ? (
        // Success view
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <IconButton 
            aria-label="close" 
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          
          <Box sx={{ mt: 3, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Payment Successful
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your payment of ${amount.toFixed(2)} has been processed successfully.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              A confirmation will be sent to your email.
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleClose}
            fullWidth
          >
            Close
          </Button>
        </Box>
      ) : (
        // Payment form view
        <>
          <DialogTitle id="payment-dialog-title">
            Make a Payment
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent ref={dialogContentRef} dividers>
            {apiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {apiError}
              </Alert>
            )}
            
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" gutterBottom>
                Account: {account?.id}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Balance: ${(account?.balance || 0).toFixed(2)}
              </Typography>
            </Paper>
            
            <form id="payment-form" onSubmit={handleSubmit}>
              <TextField
                label="Payment Amount"
                fullWidth
                margin="normal"
                type="number"
                name="amount"
                value={amount}
                onChange={handleAmountChange}
                error={!!errors.amount}
                helperText={errors.amount}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Card Details
              </Typography>
              
              <TextField
                label="Card Number"
                fullWidth
                margin="normal"
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleCardDetailsChange}
                error={!!errors.cardNumber}
                helperText={errors.cardNumber}
                disabled={isSubmitting}
                placeholder="1234 5678 9012 3456"
                inputProps={{ maxLength: 19 }}
              />
              
              <TextField
                label="Cardholder Name"
                fullWidth
                margin="normal"
                name="cardholderName"
                value={cardDetails.cardholderName}
                onChange={handleCardDetailsChange}
                error={!!errors.cardholderName}
                helperText={errors.cardholderName}
                disabled={isSubmitting}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Expiry Date"
                  margin="normal"
                  name="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={handleCardDetailsChange}
                  error={!!errors.expiryDate}
                  helperText={errors.expiryDate}
                  disabled={isSubmitting}
                  placeholder="MM/YY"
                  inputProps={{ maxLength: 5 }}
                  sx={{ flex: 1 }}
                />
                
                <TextField
                  label="CVV"
                  margin="normal"
                  name="cvv"
                  type="password"
                  value={cardDetails.cvv}
                  onChange={handleCardDetailsChange}
                  error={!!errors.cvv}
                  helperText={errors.cvv}
                  disabled={isSubmitting}
                  inputProps={{ maxLength: 4 }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </form>
          </DialogContent>
          
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="payment-form"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : null}
            >
              {isSubmitting ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default PaymentModal;