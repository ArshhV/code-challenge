import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Select, MenuItem, FormControl, 
  InputLabel, CircularProgress, InputAdornment, SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCard from '../components/AccountCard/AccountCard';
import { api } from '../services/api';
import { Account } from '../types';

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [energyTypeFilter, setEnergyTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const data = await api.getAccounts();
        setAccounts(data);
        setFilteredAccounts(data);
      } catch (err) {
        setError('Failed to fetch accounts. Please try again later.');
        console.error('Error fetching accounts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    // Apply filters when accounts, energyTypeFilter, or searchQuery changes
    let filtered = [...accounts];

    // Filter by energy type
    if (energyTypeFilter !== 'ALL') {
      filtered = filtered.filter(account => account.type === energyTypeFilter);
    }

    // Filter by search query (address)
    if (searchQuery.trim()) {
      filtered = filtered.filter(account =>
        account.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAccounts(filtered);
  }, [accounts, energyTypeFilter, searchQuery]);

  const handleEnergyTypeChange = (event: SelectChangeEvent) => {
    setEnergyTypeFilter(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Energy Accounts
      </Typography>
      
      <Box mb={4} display="flex" justifyContent="space-between" gap={2}>
        <TextField
          label="Search by Address"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel id="energy-type-filter-label">Energy Type</InputLabel>
          <Select
            labelId="energy-type-filter-label"
            id="energy-type-filter"
            value={energyTypeFilter}
            onChange={handleEnergyTypeChange}
            label="Energy Type"
          >
            <MenuItem value="ALL">All Types</MenuItem>
            <MenuItem value="ELECTRICITY">Electricity</MenuItem>
            <MenuItem value="GAS">Gas</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {filteredAccounts.length === 0 ? (
        <Typography align="center">No accounts found matching your filters.</Typography>
      ) : (
        <Box sx={{ maxWidth: "600px", mx: "auto" }}>
          {filteredAccounts.map(account => (
            <Box key={account.id} mb={3}>
              <AccountCard account={account} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AccountsPage;