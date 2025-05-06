import { Account, AccountType } from '../models/Account';

// Define specific account types with their unique properties
interface ElectricityAccount extends Account {
  type: 'ELECTRICITY';
  meterNumber: string;
}

interface GasAccount extends Account {
  type: 'GAS';
  volume: number;
}

const accounts: Account[] = [
    {
        id: "A-0001",
        accountNumber: "ELEC-0001",
        type: "ELECTRICITY",
        address: "1 Greville Ct, Thomastown, 3076, Victoria",
        balance: 30,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@email.com",
        phoneNumber: "0412345678"
    },
    {
        id: "A-0002",
        accountNumber: "GAS-0002",
        type: "GAS",
        address: "74 Taltarni Rd, Yawong Hills, 3478, Victoria",
        balance: 0,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@email.com",
        phoneNumber: "0423456789"
    },
    {
        id: "A-0003",
        accountNumber: "ELEC-0003",
        type: "ELECTRICITY",
        address: "44 William Road, Cresswell Downs, 0862, Northern Territory",
        balance: -40,
        firstName: "Emily",
        lastName: "Johnson",
        email: "emily.johnson@email.com",
        phoneNumber: "0434567890"
    },
    {
        id: "A-0004",
        accountNumber: "ELEC-0004",
        type: "ELECTRICITY",
        address: "87 Carolina Park Road, Forresters Beach, 2260, New South Wales",
        balance: 50,
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@email.com",
        phoneNumber: "0445678901"
    },
    {
        id: "A-0005",
        accountNumber: "GAS-0005",
        type: "GAS",
        address: "12 Sunset Blvd, Redcliffe, 4020, Queensland",
        balance: 25,
        firstName: "Sarah",
        lastName: "Wilson",
        email: "sarah.wilson@email.com",
        phoneNumber: "0456789012"
    },
    {
        id: "A-0006",
        accountNumber: "ELEC-0006",
        type: "ELECTRICITY",
        address: "3 Ocean View Dr, Torquay, 3228, Victoria",
        balance: -15,
        firstName: "David",
        lastName: "Lee",
        email: "david.lee@email.com",
        phoneNumber: "0467890123"
    },
    {
        id: "A-0007",
        accountNumber: "GAS-0007",
        type: "GAS",
        address: "150 Greenway Cres, Mawson Lakes, 5095, South Australia",
        balance: 0,
        firstName: "Jessica",
        lastName: "Taylor",
        email: "jessica.taylor@email.com",
        phoneNumber: "0478901234"
    },
    {
        id: "A-0008",
        accountNumber: "ELEC-0008",
        type: "ELECTRICITY",
        address: "88 Harbour St, Sydney, 2000, New South Wales",
        balance: 120,
        firstName: "Matthew",
        lastName: "Anderson",
        email: "matthew.anderson@email.com",
        phoneNumber: "0489012345"
    },
    {
        id: "A-0009",
        accountNumber: "GAS-0009",
        type: "GAS",
        address: "22 Boulder Rd, Kalgoorlie, 6430, Western Australia",
        balance: -60,
        firstName: "Olivia",
        lastName: "Martin",
        email: "olivia.martin@email.com",
        phoneNumber: "0490123456"
    },
];

// Export a consistent function name that's used throughout the codebase
export function getEnergyAccounts(): Promise<Account[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(accounts);
        }, 300); // simulate a 300ms delay for the API call
    });
}

// Alias for backward compatibility if this name is used elsewhere
export const MOCK_ENERGY_ACCOUNTS_API = getEnergyAccounts;
