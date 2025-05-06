import { DueCharge } from '../models/DueCharge';

// Define the raw data with dueDate format
const dueChargesRaw = [
    { 
        id: "D-0001", 
        accountId: "A-0001", 
        dueDate: "2025-04-01", 
        amount: 10, 
        description: "Electricity usage - March 2025",
        paid: false
    },
    { 
        id: "D-0002", 
        accountId: "A-0001", 
        dueDate: "2025-04-08", 
        amount: 20, 
        description: "Service fee - Q2 2025",
        paid: false
    },
    { 
        id: "D-0003", 
        accountId: "A-0003", 
        dueDate: "2025-03-25", 
        amount: 15, 
        description: "Electricity usage - February 2025",
        paid: true
    },
    { 
        id: "D-0004", 
        accountId: "A-0003", 
        dueDate: "2025-04-05", 
        amount: 25, 
        description: "Electricity usage - March 2025",
        paid: true
    },
    { 
        id: "D-0005", 
        accountId: "A-0004", 
        dueDate: "2025-03-30", 
        amount: 20, 
        description: "Electricity usage - March 2025",
        paid: false
    },
    { 
        id: "D-0006", 
        accountId: "A-0004", 
        dueDate: "2025-04-06", 
        amount: 15, 
        description: "Service fee - Q2 2025",
        paid: false
    },
    { 
        id: "D-0007", 
        accountId: "A-0004", 
        dueDate: "2025-04-13", 
        amount: 15, 
        description: "Late payment fee",
        paid: false
    },
    { 
        id: "D-0008", 
        accountId: "A-0005", 
        dueDate: "2025-04-04", 
        amount: 10, 
        description: "Gas usage - March 2025",
        paid: false
    },
    { 
        id: "D-0009", 
        accountId: "A-0005", 
        dueDate: "2025-04-11", 
        amount: 15, 
        description: "Service fee - Q2 2025",
        paid: false
    },
    { 
        id: "D-0010", 
        accountId: "A-0006", 
        dueDate: "2025-04-01", 
        amount: 5, 
        description: "Electricity usage - March 2025",
        paid: true
    },
    { 
        id: "D-0011", 
        accountId: "A-0006", 
        dueDate: "2025-04-09", 
        amount: 10, 
        description: "Service fee - Q2 2025",
        paid: true
    },
    { 
        id: "D-0012", 
        accountId: "A-0008", 
        dueDate: "2025-03-31", 
        amount: 40, 
        description: "Electricity usage - March 2025",
        paid: false
    },
    { 
        id: "D-0013", 
        accountId: "A-0008", 
        dueDate: "2025-04-07", 
        amount: 40, 
        description: "Service fee - Q2 2025",
        paid: false
    },
    { 
        id: "D-0014", 
        accountId: "A-0008", 
        dueDate: "2025-04-14", 
        amount: 40, 
        description: "Late payment fee",
        paid: false
    },
    { 
        id: "D-0015", 
        accountId: "A-0009", 
        dueDate: "2025-04-02", 
        amount: 30, 
        description: "Gas usage - March 2025",
        paid: true
    },
    { 
        id: "D-0016", 
        accountId: "A-0009", 
        dueDate: "2025-04-12", 
        amount: 30, 
        description: "Service fee - Q2 2025",
        paid: true
    },
];

// Transform the data to match the DueCharge interface
const dueCharges: DueCharge[] = dueChargesRaw.map(charge => ({
    id: charge.id,
    accountId: charge.accountId,
    amount: charge.amount,
    date: charge.dueDate, // Set the required date field from dueDate
    dueDate: charge.dueDate, // Keep dueDate for backward compatibility
    description: charge.description,
    paid: charge.paid
}));

// Export a consistent function name that's used throughout the codebase
export function getDueCharges(): Promise<DueCharge[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(dueCharges);
        }, 300); // simulate a 300ms delay for the API call
    });
}

// Alias for backward compatibility if this name is used elsewhere
export const MOCK_DUE_CHARGES_API = getDueCharges;
