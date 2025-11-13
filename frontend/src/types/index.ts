export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Account {
  _id: string;
  userId: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'frozen';
  overdraftLimit?: number;
  interestRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  fromAccountId?: string;
  toAccountId?: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface TransactionRequest {
  fromAccountId?: string;
  toAccountId?: string;
  accountId?: string;
  amount: number;
  description: string;
}

export interface UserAccount {
  _id: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
}

export interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accounts: UserAccount[];
}

export interface AccountSearchResult {
  _id: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  ownerName: string;
  ownerEmail: string;
}