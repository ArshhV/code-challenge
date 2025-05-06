import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, ThemeProvider, createTheme } from '@mui/material';
import AccountsPage from './pages/AccountsPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import './App.css';

// Create Origin Energy theme
const originTheme = createTheme({
  palette: {
    primary: {
      main: '#f15a22', // Origin Energy orange
    },
    secondary: {
      main: '#005091', // Origin Energy blue
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={originTheme}>
      <Router>
        <div className="App">
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Energy Accounts Portal
              </Typography>
              <Button color="inherit" component={Link} to="/">
                Accounts
              </Button>
              <Button color="inherit" component={Link} to="/payment-history">
                Payment History
              </Button>
            </Toolbar>
          </AppBar>
          <Container maxWidth="md" sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<AccountsPage />} />
              <Route path="/payment-history" element={<PaymentHistoryPage />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
