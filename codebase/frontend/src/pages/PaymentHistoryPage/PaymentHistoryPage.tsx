import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Payment } from '../../types';
import { api } from '../../services/api';

const PaymentHistoryPage: React.FC = () => {
  // State for payment data
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for table pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch payment history data
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch all payments or implement server-side
        // filtering and pagination. Here, we're simulating by fetching all payments.
        
        // Mock call to get all payments (in a real app, this might be paginated from the server)
        const data: Payment[] = [];
        
        // Fetch payments for each account - this is just a simulation
        // In a real application with a proper API, you might have a single endpoint for all payments
        const accountIds = ['A-0001', 'A-0004', 'A-0008']; // Sample account IDs
        const promises = accountIds.map(id => api.getPaymentHistory(id));
        const results = await Promise.all(promises);
        
        // Combine all payment results
        results.forEach(accountPayments => {
          data.push(...accountPayments);
        });
        
        // Sort payments by date (newest first)
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setPayments(data);
        setFilteredPayments(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch payment history. Please try again later.');
        console.error('Error fetching payment history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  // Handle filtering when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPayments(payments);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = payments.filter(payment => 
        payment.accountId.toLowerCase().includes(query) ||
        payment.id.toLowerCase().includes(query) ||
        payment.reference.toLowerCase().includes(query)
      );
      setFilteredPayments(filtered);
    }
    
    // Reset to first page when filters change
    setPage(0);
  }, [payments, searchQuery]);

  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get status color for payment status chip
  const getStatusColor = (status: string): 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      default:
        return 'warning'; // PENDING
    }
  };

  // Display loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Display error state
  if (error) {
    return (
      <Box marginTop={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Payment History
      </Typography>
      
      <Box marginBottom={3}>
        <TextField
          fullWidth
          label="Search by Account ID, Payment ID or Reference"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table aria-label="payment history table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Account ID</TableCell>
                <TableCell>Payment ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Card Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ paddingTop: 3, paddingBottom: 3 }}>
                      No payment records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>{payment.accountId}</TableCell>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.reference}</TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.status} 
                          color={getStatusColor(payment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {payment.cardDetails ? (
                          <>
                            {payment.cardDetails.cardNumber}<br />
                            <Typography variant="caption" color="textSecondary">
                              {payment.cardDetails.cardholderName}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default PaymentHistoryPage;