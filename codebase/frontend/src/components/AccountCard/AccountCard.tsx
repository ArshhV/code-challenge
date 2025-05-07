import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, CardContent, Typography, Button, Box, Chip, Divider, CircularProgress
} from '@mui/material';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PaymentModal from '../PaymentModal/PaymentModal';
import { Account } from '../../types';
import { api } from '../../services/api';

interface AccountCardProps {
  account: Account;
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDueCharges = useCallback(async () => {
    try {
      setLoading(true);
      const charges = await api.getDueCharges(account.id);
      
      // Calculate balance from due charges
      if (charges && Array.isArray(charges)) {
        const totalBalance = charges.reduce((sum, charge) => sum + charge.amount, 0);
        setBalance(totalBalance);
      } else {
        // Handle case where charges is not an array or is undefined
        setBalance(0);
      }
    } catch (error) {
      // Use a more specific error message
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error fetching due charges:', error);
      }
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [account.id]);

  useEffect(() => {
    fetchDueCharges();
  }, [fetchDueCharges]);

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'success.main';  // Green
    if (balance < 0) return 'error.main';    // Red
    return 'text.secondary';                 // Grey
  };

  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  return (
    <Card variant="outlined" sx={{ width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <Box display="flex" flexDirection="column">
          <Box display="flex" alignItems="center" marginBottom={1}>
            <Chip 
              icon={account.type === 'ELECTRICITY' ? <ElectricBoltIcon /> : <LocalFireDepartmentIcon />}
              label={account.type}
              sx={{ 
                marginRight: 1,
                bgcolor: account.type === 'ELECTRICITY' ? '#0078d4' : '#44b349', // Lighter blue for electricity, Green for gas
                color: 'white',
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
              size="small"
            />
            <Typography variant="subtitle2" color="text.secondary">
              ID: {account.id}
            </Typography>
          </Box>
          
          <Typography color="text.secondary" marginBottom={2} align="center">
            {account.address}
          </Typography>
          
          <Divider />
        </Box>
        
        <Box display="flex" alignItems="center" justifyContent="center" paddingTop={4} paddingBottom={4}>
          <Typography variant="subtitle1" component="div">
            Balance:
          </Typography>
          {loading ? (
            <CircularProgress size={20} sx={{ ml: 1 }} />
          ) : (
            <Typography 
              variant="h6" 
              component="div" 
              color={getBalanceColor(balance)}
              sx={{ marginLeft: 1, fontWeight: 'bold' }}
            >
              ${balance.toFixed(2)}
            </Typography>
          )}
        </Box>
        
        <Box display="flex" justifyContent="center">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpenPaymentModal}
            fullWidth
            disabled={loading}
          >
            Make a Payment
          </Button>
        </Box>
      </CardContent>
      
      <PaymentModal 
        open={isPaymentModalOpen} 
        onClose={handleClosePaymentModal} 
        account={account}
        balance={balance}
      />
    </Card>
  );
};

export default AccountCard;