import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Button, Box, Chip, Divider
} from '@mui/material';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PaymentModal from '../PaymentModal/PaymentModal';
import { Account } from '../../types';

interface AccountCardProps {
  account: Account;
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
          <Box display="flex" alignItems="center" mb={1}>
            <Chip 
              icon={account.type === 'ELECTRICITY' ? <ElectricBoltIcon /> : <LocalFireDepartmentIcon />}
              label={account.type}
              sx={{ 
                mr: 1,
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
          <Typography variant="h6" component="div" mb={1} align="center">
            {account.firstName} {account.lastName}
          </Typography>
          <Typography color="text.secondary" mb={2} align="center">
            {account.address}
          </Typography>
          
          <Divider />
        </Box>
        
        <Box display="flex" alignItems="center" justifyContent="center" py={4}>
          <Typography variant="subtitle1" component="div">
            Balance:
          </Typography>
          <Typography 
            variant="h6" 
            component="div" 
            color={getBalanceColor(account.balance || 0)}
            sx={{ ml: 1, fontWeight: 'bold' }}
          >
            ${(account.balance || 0).toFixed(2)}
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="center">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpenPaymentModal}
            fullWidth
          >
            Make a Payment
          </Button>
        </Box>
      </CardContent>
      
      <PaymentModal 
        open={isPaymentModalOpen} 
        onClose={handleClosePaymentModal} 
        account={account} 
      />
    </Card>
  );
};

export default AccountCard;