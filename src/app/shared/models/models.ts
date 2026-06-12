export interface User {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  province: string;
  age: number;
  occupation: string;
  salary: number;
  monthlyIncome: number;
  monthlySpending: number;
  savingsRate: number;
  bank: string;
  premiumStatus: boolean;
  device: string;
  platform: string;
  appVersion: string;
  language: string;
  persona: string;
}

export interface Account {
  id: string;
  userId: string;
  type: 'Cuenta de ahorro' | 'Cuenta corriente' | 'Tarjeta de crédito' | 'Préstamo';
  balance: number;
  number: string;
  currency: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  userId: string;
  amount: number;
  date: number; // timestamp
  concept: string;
  type: 'DEBIT' | 'CREDIT';
  merchant?: string;
  category: string;
  destinationBank?: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  createdAt: number;
}
