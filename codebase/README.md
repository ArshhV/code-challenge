# Energy Accounts Application

A React + Node.js application that renders a customer's energy accounts and allows users to make credit card payments.

## Features

### Frontend
- Displays a list of customer energy accounts in a card UI format
- Account balances change color based on value (positive: green, negative: red, zero: grey)
- Filter accounts by energy type (Electricity, Gas, or All)
- Search accounts by address
- Make a payment using credit card details with form validation
- View payment history for each account

### Backend
- RESTful API to fetch energy accounts with calculated balances
- API to process credit card payments with validation
- API to retrieve payment history
- Mock data sources for energy accounts, due charges, and payments

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository (if not already done)

2. Install backend dependencies:
```bash
cd codebase/backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd codebase/backend
npm run dev
```
The backend server will start on http://localhost:3001

2. Start the frontend development server:
```bash
cd codebase/frontend
npm start
```
The frontend will start on http://localhost:3000

## Technologies Used

### Frontend
- React (with TypeScript)
- Material UI for components
- React Router for navigation
- Axios for API calls
- Jest and React Testing Library for testing

### Backend
- Node.js + Express
- TypeScript
- Jest for testing

## Testing

### Running Backend Tests
```bash
cd codebase/backend
npm test
```

### Running Frontend Tests
```bash
cd codebase/frontend
npm test
```

## Project Structure

### Frontend
- `src/components`: Reusable UI components
- `src/pages`: Page components (Accounts, Payment History)
- `src/services`: API services
- `src/types`: TypeScript interfaces and types

### Backend
- `src/api`: Controllers and routes
- `src/models`: Data models and interfaces
- `src/services`: Business logic
- `src/mocks`: Mock data for development and testing